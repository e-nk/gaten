import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    console.log('Middleware - pathname:', pathname);
    console.log('Middleware - token role:', token?.role);

    // Admin-only routes
    const adminRoutes = ['/admin'];
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    // Protected routes (require authentication)
    const protectedRoutes = ['/dashboard', '/courses', '/my-learning', '/profile'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) || isAdminRoute;

    // If no token and trying to access protected route
    if (!token && isProtectedRoute) {
      console.log('Redirecting to signin - no token');
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // If trying to access admin route but not admin
    if (token && isAdminRoute && token.role !== 'ADMIN') {
      console.log('Redirecting to dashboard - not admin, role:', token.role);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const publicRoutes = ['/', '/auth/signin', '/auth/signup'];
        if (publicRoutes.includes(req.nextUrl.pathname)) {
          return true;
        }
        // For protected routes, require token
        return !!token;
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