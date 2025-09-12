"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navigation/navbar";
import { SessionDebug } from "@/components/debug/session-debug";
import { BookOpen, Search, Users, BarChart3, Settings, Award } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-school-primary-nyanza flex items-center justify-center">
        <div className="text-school-primary-blue">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-school-primary-nyanza">
      <Navbar />
      <SessionDebug />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-school-primary-blue mb-2">
            Welcome back, {session.user?.name}!
          </h1>
          <p className="text-gray-600">
            {session.user?.role === 'ADMIN' ? 
              'Manage your courses and monitor student progress' : 
              'Continue your learning journey'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {session.user?.role === 'ADMIN' ? (
            <>
              <Link href="/admin/courses" className="block">
                <div className="bg-white p-6 rounded-lg border border-school-primary-paledogwood hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="w-12 h-12 bg-school-primary-blue rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-school-primary-blue mb-2">
                    Manage Courses
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Create and edit your educational content
                  </p>
                </div>
              </Link>

              <div className="bg-white p-6 rounded-lg border border-school-primary-paledogwood hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-school-primary-pink rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-school-primary-blue mb-2">
                  Manage Users
                </h3>
                <p className="text-gray-600 text-sm">
                  View and manage student accounts
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-school-primary-paledogwood hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-school-primary-puce rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-school-primary-blue mb-2">
                  Analytics
                </h3>
                <p className="text-gray-600 text-sm">
                  Track engagement and progress
                </p>
              </div>
            </>
          ) : (
            <>
              <Link href="/courses" className="block">
                <div className="bg-white p-6 rounded-lg border border-school-primary-paledogwood hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="w-12 h-12 bg-school-primary-blue rounded-lg flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-school-primary-blue mb-2">
                    Browse Courses
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Discover new learning opportunities
                  </p>
                </div>
              </Link>

              <Link href="/my-learning" className="block">
                <div className="bg-white p-6 rounded-lg border border-school-primary-paledogwood hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="w-12 h-12 bg-school-primary-pink rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-school-primary-blue mb-2">
                    My Learning
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Continue your enrolled courses
                  </p>
                </div>
              </Link>

              <div className="bg-white p-6 rounded-lg border border-school-primary-paledogwood hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-school-primary-puce rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-school-primary-blue mb-2">
                  Achievements
                </h3>
                <p className="text-gray-600 text-sm">
                  View your learning progress
                </p>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-school-primary-paledogwood p-6">
          <h2 className="text-xl font-semibold text-school-primary-blue mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-8 text-gray-500">
            No recent activity to display
          </div>
        </div>
      </main>
    </div>
  );
}