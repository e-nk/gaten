"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navigation/navbar";
import { AdminGuard } from "@/components/auth/admin-guard";
import { trpc } from "@/trpc/provider";
import { useSession } from "next-auth/react";
import { BookOpen, Plus, Edit, Settings, Eye, EyeOff } from "lucide-react";

function AdminCoursesContent() {
  const { data: session } = useSession();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    level: 'BEGINNER' as const
  });

  // tRPC queries - pass session data
  const { data: courses, refetch: refetchCourses } = trpc.getAdminCourses.useQuery(
    {
      creatorId: session?.user?.id || '',
      userRole: session?.user?.role || '',
    },
    {
      enabled: !!session?.user?.id,
    }
  );
  
  const { data: categories } = trpc.getCategories.useQuery();
  
  // tRPC mutations
  const createCourseMutation = trpc.createCourse.useMutation({
    onSuccess: () => {
      refetchCourses();
      setShowCreateForm(false);
      setFormData({ title: '', description: '', categoryId: '', level: 'BEGINNER' });
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const togglePublishMutation = trpc.toggleCoursePublish.useMutation({
    onSuccess: () => {
      refetchCourses();
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !session?.user?.role) return;

    // Prepare form data - don't send empty categoryId
    const submitData: any = {
      title: formData.title,
      description: formData.description,
      level: formData.level,
      creatorId: session.user.id,
      userRole: session.user.role,
    };

    // Only include categoryId if one is selected
    if (formData.categoryId && formData.categoryId.trim() !== '') {
      submitData.categoryId = formData.categoryId;
    }

    createCourseMutation.mutate(submitData);
  };

  const handleTogglePublish = (courseId: string, currentStatus: boolean) => {
    if (!session?.user?.id || !session?.user?.role) return;

    togglePublishMutation.mutate({
      courseId,
      published: !currentStatus,
      creatorId: session.user.id,
      userRole: session.user.role,
    });
  };

  return (
    <div className="min-h-screen bg-school-primary-nyanza">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-school-primary-blue mb-2">
              Course Management
            </h1>
            <p className="text-gray-600">
              Create and manage your educational content
            </p>
          </div>
          
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Course
          </Button>
        </div>

        {/* Create Course Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-school-primary-blue mb-4">
                Create New Course
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-school-primary-blue mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                    required
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-school-primary-blue mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue h-24 resize-none"
                    placeholder="Describe your course"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-school-primary-blue mb-1">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-school-primary-blue mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                  >
                    <option value="">Select a category</option>
                    {categories?.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    disabled={createCourseMutation.isPending}
                    className="flex-1 bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
                  >
                    {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Course Stats */}
        {courses && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-school-primary-paledogwood p-4">
              <div className="text-2xl font-bold text-school-primary-blue">
                {courses.length}
              </div>
              <div className="text-sm text-gray-600">Total Courses</div>
            </div>
            <div className="bg-white rounded-lg border border-school-primary-paledogwood p-4">
              <div className="text-2xl font-bold text-green-600">
                {courses.filter(c => c.published).length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="bg-white rounded-lg border border-school-primary-paledogwood p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {courses.filter(c => !c.published).length}
              </div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map(course => (
            <div key={course.id} className="bg-white rounded-lg border border-school-primary-paledogwood p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-school-primary-blue mb-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description || 'No description provided'}
                  </p>
                  {course.category && (
                    <span className="inline-block mt-2 px-2 py-1 bg-school-primary-nyanza text-school-primary-blue text-xs rounded">
                      {course.category.name}
                    </span>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded ml-2 ${
                  course.published 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {course.published ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{course._count.enrollments} students</span>
                <span>{course._count.modules} modules</span>
                <span className="capitalize">{course.level.toLowerCase()}</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => handleTogglePublish(course.id, course.published)}
                  disabled={togglePublishMutation.isPending}
                  size="sm"
                  variant={course.published ? "outline" : "default"}
                  className={`flex-1 ${
                    course.published 
                      ? '' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {course.published ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Publish
                    </>
                  )}
                </Button>
								<Button 
									size="sm" 
									className="flex-1 bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
									onClick={() => window.location.href = `/admin/courses/${course.id}`}
								>
									<Settings className="w-4 h-4 mr-1" />
									Manage
								</Button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {(!courses || courses.length === 0) && (
            <div className="col-span-full">
              <div className="text-center py-12 bg-white rounded-lg border border-school-primary-paledogwood">
                <div className="w-16 h-16 bg-school-primary-nyanza rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-school-primary-blue" />
                </div>
                <h3 className="text-lg font-medium text-school-primary-blue mb-2">
                  No courses yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first course to get started
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCoursesPage() {
  return (
    <AdminGuard>
      <AdminCoursesContent />
    </AdminGuard>
  );
}