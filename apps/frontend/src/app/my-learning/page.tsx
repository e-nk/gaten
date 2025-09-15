"use client";

import { Navbar } from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/provider";
import { useSession } from "next-auth/react";
import { BookOpen, Clock, CheckCircle, Play } from "lucide-react";
import Link from "next/link";

export default function MyLearningPage() {
  const { data: session } = useSession();

  // tRPC query
  const { data: enrollments, isLoading } = trpc.getMyEnrollments.useQuery(
    { userId: session?.user?.id || '' },
    { enabled: !!session?.user?.id }
  );

  if (!session) {
    return (
      <div className="min-h-screen bg-school-primary-nyanza">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-school-primary-blue mb-4">
            Please sign in to view your learning progress
          </h1>
          <Link href="/auth/signin">
            <Button className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-school-primary-nyanza">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-school-primary-blue mb-2">
            My Learning
          </h1>
          <p className="text-gray-600">
            Continue your learning journey
          </p>
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-school-primary-paledogwood p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-school-primary-blue mr-3" />
              <div>
                <div className="text-2xl font-bold text-school-primary-blue">
                  {enrollments?.length || 0}
                </div>
                <div className="text-gray-600 text-sm">Enrolled Courses</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-school-primary-paledogwood p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-school-primary-blue">
                  {enrollments?.filter(e => e.completedAt).length || 0}
                </div>
                <div className="text-gray-600 text-sm">Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-school-primary-paledogwood p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-school-primary-pink mr-3" />
              <div>
                <div className="text-2xl font-bold text-school-primary-blue">
                  {enrollments?.reduce((total, e) => total + e.totalTimeSpent, 0) || 0}m
                </div>
                <div className="text-gray-600 text-sm">Time Spent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-school-primary-paledogwood p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        )}

        {/* Enrolled Courses */}
        {!isLoading && enrollments && enrollments.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-school-primary-blue">
              Continue Learning
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enrollments.map(enrollment => (
                <div key={enrollment.id} className="bg-white rounded-lg border border-school-primary-paledogwood p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-school-primary-blue mb-1">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {enrollment.course.description}
                      </p>
                      {enrollment.course.category && (
                        <span className="inline-block mt-2 px-2 py-1 bg-school-primary-nyanza text-school-primary-blue text-xs rounded">
                          {enrollment.course.category.name}
                        </span>
                      )}
                    </div>
                    {enrollment.completedAt && (
                      <CheckCircle className="w-6 h-6 text-green-500 ml-4" />
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(enrollment.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-school-primary-blue h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{enrollment.course._count.modules} modules</span>
                    <span>{enrollment.totalTimeSpent}m spent</span>
                    {enrollment.lastAccessedAt && (
                      <span>
                        Last accessed: {new Date(enrollment.lastAccessedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                 <Button 
										onClick={() => window.location.href = `/course/${enrollment.course.id}`}
										className="w-full bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
									>
										<Play className="w-4 h-4 mr-2" />
										{enrollment.completedAt ? 'Review Course' : 'Continue Learning'}
									</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!enrollments || enrollments.length === 0) && (
          <div className="text-center py-12 bg-white rounded-lg border border-school-primary-paledogwood">
            <div className="w-16 h-16 bg-school-primary-nyanza rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-school-primary-blue" />
            </div>
            <h3 className="text-lg font-medium text-school-primary-blue mb-2">
              No enrolled courses yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start learning by enrolling in your first course
            </p>
            <Link href="/courses">
              <Button className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white">
                Browse Courses
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}