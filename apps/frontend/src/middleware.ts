import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log('🔒 MIDDLEWARE EXECUTING');
    console.log('🔗 URL:', req.url);
    console.log('📍 Pathname:', req.nextUrl.pathname);
    
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    console.log('👤 Token exists:', !!token);
    console.log('🎭 Token role:', token?.role);

    // Admin-only routes
    const adminRoutes = ['/admin'];
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    console.log('🚨 Is admin route:', isAdminRoute);

    // Protected routes (require authentication)
    const protectedRoutes = ['/dashboard', '/courses', '/my-learning', '/profile'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) || isAdminRoute;

    console.log('🔐 Is protected route:', isProtectedRoute);

    // If no token and trying to access protected route
    if (!token && isProtectedRoute) {
      console.log('❌ Redirecting to signin - no token');
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // If trying to access admin route but not admin
    if (token && isAdminRoute && token.role !== 'ADMIN') {
      console.log('❌ Redirecting to dashboard - not admin, role:', token.role);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    console.log('✅ Allowing access');
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('🔍 AUTHORIZED CALLBACK');
        console.log('📍 Path:', req.nextUrl.pathname);
        console.log('👤 Has token:', !!token);
        
        // Allow access to public routes
        const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/api'];
        const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));
        
        if (isPublicRoute) {
          console.log('✅ Public route allowed');
          return true;
        }
        
        // For protected routes, require token
        const hasToken = !!token;
        console.log('🎯 Protected route, has token:', hasToken);
        return hasToken;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/courses/:path*',
    '/my-learning/:path*',
    '/profile/:path*'
  ]
};