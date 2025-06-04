// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { jwtDecrypt } from 'jose';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    isEmailVerified?: boolean;
  };
}

const AUTH_SECRET_STRING = process.env.AUTH_SECRET;

console.log('[AuthMiddleware] AUTH_SECRET from env:',
  AUTH_SECRET_STRING ? `"${AUTH_SECRET_STRING.substring(0, 3)}... (length ${AUTH_SECRET_STRING.length})"` : 'NOT SET or EMPTY');

if (!AUTH_SECRET_STRING) {
  console.error('CRITICAL: AUTH_SECRET environment variable is not set or is empty for the API. This will cause authentication to fail.');
}

let secretKey: Uint8Array | undefined;
try {
  if (AUTH_SECRET_STRING) {
    secretKey = new TextEncoder().encode(AUTH_SECRET_STRING);
    console.log('[AuthMiddleware] Secret key encoded. Length:', secretKey.byteLength);
    if (secretKey.byteLength === 0) {
        console.error('[AuthMiddleware] CRITICAL: Encoded secret key has ZERO length. AUTH_SECRET might be an empty string or problematic.');
    }
  } else {
    console.error('[AuthMiddleware] CRITICAL: AUTH_SECRET_STRING is missing, cannot encode secret key.');
  }
} catch (encodeError: any) {
  console.error('[AuthMiddleware] CRITICAL: Error encoding AUTH_SECRET:', encodeError.message);
  secretKey = undefined;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log(`[AuthMiddleware] Request received for: ${req.path} from ${req.ip}`);
  try {
    if (!secretKey || secretKey.byteLength === 0) {
      console.error('[AuthMiddleware] Aborting: Secret key is not available or invalid (zero length). Check AUTH_SECRET env var.');
      res.status(500).json({ error: 'Internal Server Error: Authentication secret misconfigured.' });
      return;
    }

    // Using Express's built-in cookie parsing (requires cookie-parser middleware to be applied first)
    const cookies = req.cookies;

    if (!cookies) {
      console.log(`[AuthMiddleware] No cookies found for path: ${req.path}. Make sure cookie-parser middleware is applied.`);
      res.status(401).json({ error: 'Unauthorized. No cookies provided.' });
      return;
    }

    const sessionToken = cookies['authjs.session-token'] || cookies['next-auth.session-token'];

    if (!sessionToken) {
      console.log(`[AuthMiddleware] No session token found in cookies for path: ${req.path}. Available cookies:`, Object.keys(cookies));
      res.status(401).json({ error: 'Unauthorized. No session token found.' });
      return;
    }

    console.log(`[AuthMiddleware] Session token found for path: ${req.path}. Length:`, sessionToken.length);
    console.log('[AuthMiddleware] Attempting to decrypt token with secret key (length: ' + secretKey.byteLength + ')');

    let decryptedResult;
    try {
      decryptedResult = await jwtDecrypt(sessionToken, secretKey);
    } catch (decryptionError: any) {
      console.error(`[AuthMiddleware] jwtDecrypt FAILED for path: ${req.path}.`);
      console.error('Decryption Error Code:', decryptionError.code);
      console.error('Decryption Error Message:', decryptionError.message);
      
      let clientErrorMessage = 'Unauthorized. Token decryption failed.';
      if (decryptionError.code === 'ERR_JWE_DECRYPTION_FAILED') {
        clientErrorMessage = 'Unauthorized. Token decryption failed (likely incorrect secret or tampered token).';
      } else if (decryptionError.code === 'ERR_JWE_INVALID') {
        clientErrorMessage = 'Unauthorized. Invalid token format.';
      }
      
      res.status(401).json({ error: clientErrorMessage, internalCode: decryptionError.code || 'UNKNOWN_DECRYPTION_ERROR' });
      return;
    }

    const payload = decryptedResult.payload;

    if (!payload || typeof payload.uid !== 'string') {
      console.error(`[AuthMiddleware] Decrypted payload is invalid or missing uid for path: ${req.path}. Payload:`, payload);
      res.status(401).json({ error: 'Unauthorized. Invalid token payload content.' });
      return;
    }

    req.user = {
      id: payload.uid as string,
      name: payload.name as string | undefined,
      email: payload.email as string | undefined,
      role: payload.role as string,
      isEmailVerified: payload.isEmailVerified as boolean,
    };

    next();
  } catch (error: any) {
    console.error(`[AuthMiddleware] UNEXPECTED OUTER CATCH BLOCK ERROR for path: ${req.path}:`, error.message);
    console.error('Outer Catch Stack:', error.stack);
    res.status(500).json({
      error: 'Internal Server Error: Unexpected issue in authentication middleware.',
      detail: error.message
    });
  }
};

// If you choose this approach, make sure to install and apply cookie-parser middleware:
// npm install cookie-parser @types/cookie-parser
// 
// In your app.ts or main server file:
// import cookieParser from 'cookie-parser';
// app.use(cookieParser());