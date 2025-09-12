"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navigation/navbar";
import { BookOpen, Plus } from "lucide-react";

export default function AdminCoursesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // We'll implement tRPC mutation here
    console.log('Creating course:', formData);
    setShowCreateForm(false);
    setFormData({ title: '', description: '', categoryId: '' });
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
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
                  >
                    <option value="">Select a category</option>
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-school-primary-blue hover:bg-school-primary-blue/90 text-white"
                  >
                    Create Course
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

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Course Card */}
          <div className="bg-white rounded-lg border border-school-primary-paledogwood p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-school-primary-blue mb-1">
                  Introduction to Programming
                </h3>
                <p className="text-sm text-gray-600">
                  Learn the basics of programming
                </p>
              </div>
              <span className="px-2 py-1 bg-school-primary-nyanza text-school-primary-blue text-xs rounded">
                Draft
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>0 students</span>
              <span>0 modules</span>
            </div>

            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                Edit
              </Button>
              <Button size="sm" className="flex-1 bg-school-primary-blue hover:bg-school-primary-blue/90 text-white">
                Manage
              </Button>
            </div>
          </div>

          {/* Empty State */}
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
        </div>
      </div>
    </div>
  );
}