import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token');
  const path = request.nextUrl.pathname;

  const isPublicAuthPath = path === '/auth/login' || path === '/auth/signup' || path === '/';
  const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/interview');

  // If user is logged in and trying to access login/signup/landing page, redirect to dashboard
  if (isPublicAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is NOT logged in and trying to access protected routes, redirect to login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/dashboard/:path*',
    '/interview/:path*'
  ]
};
