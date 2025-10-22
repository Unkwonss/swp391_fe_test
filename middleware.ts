import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  const { pathname } = request.nextUrl;

  // Debug log
  if (pathname.startsWith('/subscription') || pathname.startsWith('/payment') || pathname.startsWith('/profile')) {
    console.log(`[Middleware] ${pathname} - Token: ${token ? 'Present' : 'Missing'}`);
  }

  // Public routes
  const publicRoutes = ['/', '/login', '/register', '/search', '/posts', '/subscription'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Auth routes - redirect if logged in
  if ((pathname.startsWith('/login') || pathname.startsWith('/register')) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protected user routes (removed /subscription - allow public view)
  const userRoutes = ['/dashboard', '/my-posts', '/create-post', '/payment', '/payment-history', '/profile'];
  const isUserRoute = userRoutes.some(route => pathname.startsWith(route));

  if (isUserRoute && !token) {
    console.log(`[Middleware] Redirecting ${pathname} to /login - No token`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protected admin routes
  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // TODO: Add role checking for admin routes
  // if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
