"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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
      {/* Header */}
      <header className="bg-white border-b border-school-primary-paledogwood">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-school-primary-blue">
              Gaten LMS
            </h1>
            
            <div className="flex items-center gap-4">
              <span className="text-school-primary-blue">
                Welcome, {session.user?.name}
              </span>
              <span className="px-2 py-1 bg-school-primary-nyanza text-school-primary-blue text-xs rounded">
                {session.user?.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-school-primary-blue mb-2">
            Dashboard
          </h2>
          <p className="text-gray-600">
            {session.user?.role === 'ADMIN' ? 
              'Manage courses and monitor student progress' : 
              'Continue your learning journey'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {session.user?.role === 'ADMIN' ? (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-school-primary-blue mb-2">
                  Create Course
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Build a new course for students
                </p>
                <Button className="bg-school-primary-blue hover:bg-school-primary-blue/90">
                  Create Course
                </Button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-school-primary-blue mb-2">
                  Manage Categories
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Organize course categories
                </p>
                <Button variant="outline">
                  Manage Categories
                </Button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-school-primary-blue mb-2">
                  View Analytics
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Track student progress
                </p>
                <Button variant="outline">
                  View Analytics
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-school-primary-blue mb-2">
                  Browse Courses
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Discover new learning opportunities
                </p>
                <Button className="bg-school-primary-blue hover:bg-school-primary-blue/90">
                  Browse Courses
                </Button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-school-primary-blue mb-2">
                  My Learning
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Continue your enrolled courses
                </p>
                <Button variant="outline">
                  My Courses
                </Button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-school-primary-blue mb-2">
                  Achievements
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  View your learning progress
                </p>
                <Button variant="outline">
                  View Progress
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity Placeholder */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-school-primary-blue mb-4">
            Recent Activity
          </h3>
          <p className="text-gray-500 text-center py-8">
            No recent activity to display
          </p>
        </div>
      </main>
    </div>
  );
}