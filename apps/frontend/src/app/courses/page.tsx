"use client";

import { Navbar } from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { Search, Star } from "lucide-react";

export default function CoursesPage() {
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full px-4 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue"
              />
            </div>
            <div>
              <select className="px-4 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue">
                <option value="">All Categories</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div>
              <select className="px-4 py-2 border border-school-primary-paledogwood rounded-md focus:outline-none focus:ring-2 focus:ring-school-primary-blue">
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Course Card */}
          <div className="bg-white rounded-lg border border-school-primary-paledogwood overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-school-primary-blue to-school-primary-paledogwood"></div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-school-primary-blue">
                  Introduction to Programming
                </h3>
                <span className="px-2 py-1 bg-school-primary-nyanza text-school-primary-blue text-xs rounded">
                  Beginner
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                Learn the fundamentals of programming with hands-on exercises and real-world projects.
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-4 h-4 fill-yellow-400 text-yellow-400" 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-1">(4.8)</span>
                </div>
                <span className="text-sm text-gray-600">24 lessons</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-school-primary-blue">Free</span>
                <Button className="bg-school-primary-blue hover:bg-school-primary-blue/90 text-white">
                  Enroll Now
                </Button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="col-span-full">
            <div className="text-center py-12 bg-white rounded-lg border border-school-primary-paledogwood">
              <div className="w-16 h-16 bg-school-primary-nyanza rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-school-primary-blue" />
              </div>
              <h3 className="text-lg font-medium text-school-primary-blue mb-2">
                No courses available yet
              </h3>
              <p className="text-gray-600">
                Check back soon for new learning opportunities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}