"use client";

import { useState } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/provider";
import { useSession } from "next-auth/react";
import { Search, Filter, Star, Users, BookOpen, Clock } from "lucide-react";

export default function CoursesPage() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    level: '' as '' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  });

  // Prepare the query input - only include non-empty values
  const queryInput = (() => {
    const input: any = {};
    
    if (filters.search && filters.search.trim() !== '') {
      input.search = filters.search.trim();
    }
    
    if (filters.categoryId && filters.categoryId.trim() !== '') {
      input.categoryId = filters.categoryId;
    }
    
    if (filters.level && filters.level.trim() !== '') {
      input.level = filters.level;
    }
    
    return input;
  })();

  // tRPC queries
  const { data: courses, isLoading, error } = trpc.getCourses.useQuery(queryInput);
  const { data: categories } = trpc.getCategories.useQuery();
  
  // Get user's enrollments to check enrollment status
  const { data: enrollments, refetch: refetchEnrollments } = trpc.getMyEnrollments.useQuery(
    { userId: session?.user?.id || '' },
    { enabled: !!session?.user?.id }
  );

  // tRPC mutations
  const enrollMutation = trpc.enrollInCourse.useMutation({
    onSuccess: () => {
      refetchEnrollments();
      alert('Successfully enrolled in course!');
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const handleEnroll = (courseId: string) => {
    if (!session?.user?.id) {
      alert('Please sign in to enroll in courses');
      return;
    }

    enrollMutation.mutate({
      courseId,
      userId: session.user.id
    });
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-600';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-600';
      case 'ADVANCED': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Check if user is enrolled in a specific course
  const isEnrolledInCourse = (courseId: string) => {
    return enrollments?.some(enrollment => enrollment.course.id === courseId) || false;
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-school-primary-nyanza">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 bg-white rounded-lg border border-school-primary-paledogwood">
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Error loading courses
            </h3>
            <p className="text-gray-600">
              {error.message || 'Something went wrong'}
            </p>
          </div>
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
            Browse Courses
          </h1>
          <p className="text-gray-600">
            Discover new skills and advance your knowledge
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-school-primary-paledogwood p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
              />
            </div>

            {/* Category Filter */}
            <div className="min-w-0 lg:w-48">
              <select
                value={filters.categoryId}
                onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-4 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
              >
                <option value="">All Categories</option>
                {categories?.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category._count.courses})
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="min-w-0 lg:w-48">
              <select
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value as any }))}
                className="w-full px-4 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
              >
                <option value="">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-school-primary-paledogwood overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Course Grid */}
        {!isLoading && courses && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const isEnrolled = isEnrolledInCourse(course.id);
              
              return (
                <div key={course.id} className="bg-white rounded-lg border border-school-primary-paledogwood overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Course Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-school-primary-blue to-school-primary-paledogwood relative">
                    <div className="absolute top-4 left-4">
                      <span className={`px-2 py-1 text-xs rounded font-medium ${getLevelColor(course.level)}`}>
                        {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                      </span>
                    </div>
                    {course.category && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 bg-white text-school-primary-blue text-xs rounded">
                          {course.category.name}
                        </span>
                      </div>
                    )}
                    {isEnrolled && (
                      <div className="absolute bottom-4 left-4">
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                          Enrolled
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    {/* Course Title and Description */}
                    <h3 className="font-semibold text-school-primary-blue mb-2">
                      {course.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description || 'No description available'}
                    </p>
                    
                    {/* Course Stats */}
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{course._count.enrollments} students</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span>{course._count.modules} modules</span>
                      </div>
                      {course._count.reviews > 0 && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                          <span>{course.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600">
                        By {course.creator.name}
                      </div>
                      <div className="text-lg font-bold text-school-primary-blue">
                        Free
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    {!session ? (
                      <Button
                        onClick={() => window.location.href = '/auth/signin'}
                        className="w-full bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
                      >
                        Sign in to Enroll
                      </Button>
                    ) : isEnrolled ? (
                      <Button
                        onClick={() => window.location.href = `/course/${course.id}`}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        Continue Learning
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollMutation.isPending}
                        className="w-full bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
                      >
                        {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!courses || courses.length === 0) && (
          <div className="text-center py-12 bg-white rounded-lg border border-school-primary-paledogwood">
            <div className="w-16 h-16 bg-school-primary-nyanza rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-school-primary-blue" />
            </div>
            <h3 className="text-lg font-medium text-school-primary-blue mb-2">
              No courses found
            </h3>
            <p className="text-gray-600 mb-4">
              {Object.keys(queryInput).length > 0
                ? 'Try adjusting your search filters'
                : 'No published courses are available yet'
              }
            </p>
            {Object.keys(queryInput).length > 0 && (
              <Button
                onClick={() => setFilters({ search: '', categoryId: '', level: '' })}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}