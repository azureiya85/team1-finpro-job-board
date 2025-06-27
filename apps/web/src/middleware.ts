import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: Request) {
  const session = await auth();
  
  if (request.url.includes('/analytics')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session.user.role !== 'Developer') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/analytics/:path*"]
};