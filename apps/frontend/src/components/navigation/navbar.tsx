"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  if (status === 'loading') {
    return (
      <nav className="bg-white border-b border-school-primary-paledogwood">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="h-6 w-24 bg-school-primary-paledogwood animate-pulse rounded"></div>
            <div className="h-8 w-20 bg-school-primary-paledogwood animate-pulse rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-school-primary-paledogwood sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-school-primary-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-xl font-bold text-school-primary-blue">Gaten</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {session ? (
              <>
                <Link 
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/dashboard') 
                      ? 'text-school-primary-blue border-b-2 border-school-primary-blue pb-1' 
                      : 'text-gray-600 hover:text-school-primary-blue'
                  }`}
                >
                  Dashboard
                </Link>

                {session.user?.role === 'ADMIN' ? (
                  <>
                    <Link 
                      href="/admin/courses"
                      className={`text-sm font-medium transition-colors ${
                        isActive('/admin/courses') 
                          ? 'text-school-primary-blue border-b-2 border-school-primary-blue pb-1' 
                          : 'text-gray-600 hover:text-school-primary-blue'
                      }`}
                    >
                      Manage Courses
                    </Link>
                    <Link 
                      href="/admin/users"
                      className={`text-sm font-medium transition-colors ${
                        isActive('/admin/users') 
                          ? 'text-school-primary-blue border-b-2 border-school-primary-blue pb-1' 
                          : 'text-gray-600 hover:text-school-primary-blue'
                      }`}
                    >
                      Users
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/courses"
                      className={`text-sm font-medium transition-colors ${
                        isActive('/courses') 
                          ? 'text-school-primary-blue border-b-2 border-school-primary-blue pb-1' 
                          : 'text-gray-600 hover:text-school-primary-blue'
                      }`}
                    >
                      Browse Courses
                    </Link>
                    <Link 
                      href="/my-learning"
                      className={`text-sm font-medium transition-colors ${
                        isActive('/my-learning') 
                          ? 'text-school-primary-blue border-b-2 border-school-primary-blue pb-1' 
                          : 'text-gray-600 hover:text-school-primary-blue'
                      }`}
                    >
                      My Learning
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-sm font-medium text-gray-600 hover:text-school-primary-blue">
                  Sign In
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          {session && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-school-primary-blue">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {session.user?.role?.toLowerCase()}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-school-primary-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {session.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                
                <Button 
                  onClick={() => signOut()}
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}