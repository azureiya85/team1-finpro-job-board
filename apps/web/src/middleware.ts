import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; 
const MAX_REQUESTS_PER_WINDOW = 100; 
const STRICT_RATE_LIMIT_PATHS = ['/api/auth', '/api/users'];
const STRICT_MAX_REQUESTS = 20; 

// In-memory rate limit store (use Redis for production)
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

// Bot detection patterns
const BOT_USER_AGENTS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python/i
];

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /\.\./,           
  /<script/i,      
  /union.*select/i,
  /javascript:/i,  
  /data:/i,         
  /vbscript:/i,     
];

const PROTECTED_ROUTES = {
  '/analytics': ['ADMIN', 'Developer'],
  '/dashboard/developer': ['Developer', 'ADMIN'],
  '/dashboard/company-redirect': ['COMPANY_ADMIN', 'ADMIN', 'Developer'],
} as const;

const PUBLIC_ROUTES = [
  '/',
  '/jobs',
  '/about',
  '/privacy-policy',
  '/auth/login',
  '/auth/register',
  '/auth/register-company',
  '/auth/register-developer',
  '/auth/verify-email',
  '/companies', 
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Rate limiting function
function checkRateLimit(ip: string, path: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const key = `${ip}:${path}`;
  const stored = rateLimitStore.get(key);
  
  // Determine limits based on path
  const isStrictPath = STRICT_RATE_LIMIT_PATHS.some(strictPath => path.startsWith(strictPath));
  const maxRequests = isStrictPath ? STRICT_MAX_REQUESTS : MAX_REQUESTS_PER_WINDOW;
  
  if (!stored || now - stored.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }
  
  if (stored.count >= maxRequests) {
    const resetTime = stored.windowStart + RATE_LIMIT_WINDOW;
    return { allowed: false, resetTime };
  }
  
  // Increment counter
  stored.count++;
  return { allowed: true };
}

// Security checks
function performSecurityChecks(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = request.nextUrl.pathname + request.nextUrl.search;
  
  // Bot detection
  const isBot = BOT_USER_AGENTS.some(pattern => pattern.test(userAgent));
  
  // Suspicious pattern detection
  const hasSuspiciousPattern = SUSPICIOUS_PATTERNS.some(pattern => pattern.test(url));
  
  // Check for suspicious headers
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const referer = request.headers.get('referer');
  const userAgentHeader = request.headers.get('user-agent');
  
  const hasInvalidHeaders = [
    xForwardedFor?.includes('..'),
    referer?.includes('<script'),
    userAgentHeader && userAgentHeader.length > 500,
  ].some(Boolean);
  
  return {
    isBot,
    hasSuspiciousPattern,
    hasInvalidHeaders,
    isBlocked: hasSuspiciousPattern || hasInvalidHeaders,
  };
}

// Logging function
function logRequest(request: NextRequest, userId?: string, action?: string) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const timestamp = new Date().toISOString();
  const path = request.nextUrl.pathname;
  
  // In production, use Winston, pino or cloud logging
  console.log(JSON.stringify({
    timestamp,
    ip,
    userId: userId || 'anonymous',
    path,
    method: request.method,
    userAgent,
    action: action || 'page_access',
    query: Object.fromEntries(request.nextUrl.searchParams),
  }));
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === pathname) return true;
    
    if (route === '/companies' && pathname.startsWith('/companies')) {
      return true;
    }
    
    if (pathname.startsWith(route + '/')) {
      return true;
    }
    
    return false;
  });
}

// Check if user has required role for protected route
function hasRequiredRole(userRole: string, requiredRoles: readonly string[]): boolean {
  return requiredRoles.includes(userRole);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  try {
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/api/companies') ||
      pathname.startsWith('/api/jobs') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }
    
    // Security checks
    const securityCheck = performSecurityChecks(request);
    
    if (securityCheck.isBlocked) {
      logRequest(request, undefined, 'security_blocked');
      return new NextResponse('Blocked', { status: 403 });
    }
    
    // Rate limiting
    const rateLimitCheck = checkRateLimit(ip, pathname);
    if (!rateLimitCheck.allowed) {
      logRequest(request, undefined, 'rate_limited');
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimitCheck.resetTime!),
        }
      });
    }
    
    // Get session
    const session = await auth();
    
    // Log the request
    logRequest(request, session?.user?.id, 'access_attempt');
    
    // Check if route is public
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }
    
    // Authentication required for non-public routes
    if (!session?.user) {
      logRequest(request, undefined, 'auth_required');
      
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      // For pages, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check role-based access for protected routes
    const userRole = session.user.role;
    let hasAccess = true;
    let matchedRoute = '';
    
    // Check if current path matches any protected route
    for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
      if (pathname.startsWith(route)) {
        matchedRoute = route;
        hasAccess = hasRequiredRole(userRole, allowedRoles);
        break;
      }
    }
    
    // If path matches a protected route but user doesn't have access
    if (matchedRoute && !hasAccess) {
      logRequest(request, session.user.id, 'access_denied');
      
      // For API routes, return 403
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
      
      // For pages, redirect based on user role
      let redirectUrl = '/';
      switch (userRole) {
        case 'USER':
          redirectUrl = '/dashboard';
          break;
        case 'COMPANY_ADMIN':
          redirectUrl = '/dashboard/company-redirect';
          break;
        case 'ADMIN':
        case 'Developer':
          redirectUrl = '/dashboard/developer';
          break;
        default:
          redirectUrl = '/';
      }
      
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
        
    // Add security headers
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Add user info to headers for downstream use (optional)
    if (session?.user) {
      response.headers.set('X-User-ID', session.user.id);
      response.headers.set('X-User-Role', session.user.role);
    }
    
    logRequest(request, session?.user?.id, 'access_granted');
    return response;
    
  } catch (error) {
    console.error('Middleware error:', error);
    logRequest(request, undefined, 'middleware_error');
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};