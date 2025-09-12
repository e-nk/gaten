import { router, publicProcedure } from './trpc';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

let db: PrismaClient | null = null;

const getDb = () => {
  if (!db) {
    db = new PrismaClient();
  }
  return db;
};

export const appRouter = router({
  // Public procedures
  healthCheck: publicProcedure.query(async () => {
    try {
      const database = getDb();
      await database.$queryRaw`SELECT 1`;
      
      const userCount = await database.user.count();
      const courseCount = await database.course.count();
      const categoryCount = await database.category.count();
      
      return { 
        status: 'tRPC is working!', 
        database: 'Connected',
        tables: {
          users: userCount,
          courses: courseCount,
          categories: categoryCount
        }
      };
    } catch (error) {
      return { 
        status: 'tRPC is working!', 
        database: 'Disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }),

  createSampleData: publicProcedure.mutation(async () => {
  try {
    const database = getDb();
    
    // Create multiple categories
    const categories = [
      {
        name: 'ECONOMICS & SOCIETY',
        slug: 'economics-society',
        description: 'Learn about economics, politics, and society',
        color: '#0b1320',
        order: 1
      },
      {
        name: 'Design',
        slug: 'design',
        description: 'Creative design skills',
        color: '#C9B7AD',
        order: 2
      },
      {
        name: 'Business',
        slug: 'business',
        description: 'Business and entrepreneurship',
        color: '#CC76A1',
        order: 3
      },
      {
        name: 'Marketing',
        slug: 'marketing',
        description: 'Digital marketing strategies',
        color: '#DD9296',
        order: 4
      }
    ];

    for (const categoryData of categories) {
      await database.category.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: categoryData
      });
    }

    return {
      success: true,
      message: 'Sample categories created successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}),

  // Category procedures
  getCategories: publicProcedure.query(async () => {
    const database = getDb();
    const categories = await database.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });
    return categories;
  }),

  // Course procedures - require userId to be passed from frontend
  getCourses: publicProcedure
  .input(z.object({
    search: z.string().optional(),
    categoryId: z.string().optional(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  }).transform(data => ({
    // Transform empty strings to undefined
    search: data.search && data.search.trim() !== '' ? data.search : undefined,
    categoryId: data.categoryId && data.categoryId.trim() !== '' ? data.categoryId : undefined,
    level: data.level && data.level.trim() !== '' ? data.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' : undefined,
  })))
  .query(async ({ input }) => {
    const database = getDb();
    
    const whereClause: any = {
      published: true,
    };

    if (input.search) {
      whereClause.OR = [
        { title: { contains: input.search, mode: 'insensitive' } },
        { description: { contains: input.search, mode: 'insensitive' } },
      ];
    }

    if (input.categoryId) {
      whereClause.categoryId = input.categoryId;
    }

    if (input.level) {
      whereClause.level = input.level;
    }

    const courses = await database.course.findMany({
      where: whereClause,
      include: {
        creator: {
          select: { name: true }
        },
        category: {
          select: { name: true, color: true }
        },
        _count: {
          select: { 
            enrollments: true,
            modules: true,
            reviews: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return courses;
  }),

  enrollInCourse: publicProcedure
    .input(z.object({
      courseId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const database = getDb();
      
      // Check if already enrolled
      const existingEnrollment = await database.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: input.userId,
            courseId: input.courseId
          }
        }
      });

      if (existingEnrollment) {
        throw new Error('Already enrolled in this course');
      }

      // Create enrollment
      const enrollment = await database.enrollment.create({
        data: {
          userId: input.userId,
          courseId: input.courseId,
        },
        include: {
          course: {
            select: { title: true }
          }
        }
      });

      // Update enrollment count
      await database.course.update({
        where: { id: input.courseId },
        data: {
          enrollmentCount: {
            increment: 1
          }
        }
      });

      return enrollment;
    }),

  getMyEnrollments: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ input }) => {
      const database = getDb();
      
      const enrollments = await database.enrollment.findMany({
        where: { userId: input.userId },
        include: {
          course: {
            include: {
              category: {
                select: { name: true, color: true }
              },
              _count: {
                select: { modules: true }
              }
            }
          }
        },
        orderBy: { lastAccessedAt: 'desc' }
      });

      return enrollments;
    }),

  // Admin procedures - require userId and role validation from frontend
  createCourse: publicProcedure
  .input(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    categoryId: z.string().nullish(), // Changed from optional to nullish
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
    creatorId: z.string(),
    userRole: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Validate admin access
    if (input.userRole !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    const database = getDb();
    
    // Generate slug from title
    const slug = input.title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    // Prepare course data
    const courseData: any = {
      title: input.title,
      slug,
      level: input.level,
      creatorId: input.creatorId,
    };

    // Add optional fields only if they have values
    if (input.description) {
      courseData.description = input.description;
    }

    if (input.categoryId) {
      courseData.categoryId = input.categoryId;
    }
    
    const course = await database.course.create({
      data: courseData,
      include: {
        category: {
          select: { name: true }
        }
      }
    });
    
    return course;
  }),

  getAdminCourses: publicProcedure
    .input(z.object({
      creatorId: z.string(),
      userRole: z.string(),
    }))
    .query(async ({ input }) => {
      // Validate admin access
      if (input.userRole !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      const database = getDb();
      
      const courses = await database.course.findMany({
        where: { creatorId: input.creatorId },
        include: {
          category: {
            select: { name: true, color: true }
          },
          _count: {
            select: { 
              enrollments: true,
              modules: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return courses;
    }),

		toggleCoursePublish: publicProcedure
		.input(z.object({
			courseId: z.string(),
			published: z.boolean(),
			creatorId: z.string(),
			userRole: z.string(),
		}))
		.mutation(async ({ input }) => {
			// Validate admin access
			if (input.userRole !== 'ADMIN') {
				throw new Error('Admin access required');
			}

			const database = getDb();
			
			const course = await database.course.update({
				where: { 
					id: input.courseId,
					creatorId: input.creatorId // Ensure user owns the course
				},
				data: {
					published: input.published
				},
				include: {
					category: {
						select: { name: true }
					}
				}
			});

			return course;
		}),

		// Module management procedures
createModule: publicProcedure
  .input(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    courseId: z.string(),
    order: z.number().int().min(0),
    creatorId: z.string(),
    userRole: z.string(),
  }))
  .mutation(async ({ input }) => {
    if (input.userRole !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    const database = getDb();
    
    // Verify user owns the course
    const course = await database.course.findFirst({
      where: { 
        id: input.courseId, 
        creatorId: input.creatorId 
      }
    });

    if (!course) {
      throw new Error('Course not found or access denied');
    }

    const module = await database.module.create({
      data: {
        title: input.title,
        description: input.description,
        courseId: input.courseId,
        order: input.order,
      },
      include: {
        _count: {
          select: { lessons: true }
        }
      }
    });

    return module;
  }),

getCourseModules: publicProcedure
  .input(z.object({
    courseId: z.string(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    const modules = await database.module.findMany({
      where: { courseId: input.courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            type: true,
            order: true,
            estimatedDuration: true,
          }
        },
        _count: {
          select: { lessons: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    return modules;
  }),

// Lesson management procedures
createLesson: publicProcedure
  .input(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    content: z.string().optional(),
    type: z.enum(['TEXT', 'VIDEO', 'QUIZ', 'ASSIGNMENT', 'INTERACTIVE']).default('TEXT'),
    moduleId: z.string(),
    order: z.number().int().min(0),
    estimatedDuration: z.number().int().min(0).optional(),
    videoUrl: z.string().optional(),
    videoDuration: z.number().int().optional(),
    creatorId: z.string(),
    userRole: z.string(),
  }))
  .mutation(async ({ input }) => {
    if (input.userRole !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    const database = getDb();
    
    // Verify user owns the course that contains this module
    const module = await database.module.findFirst({
      where: { id: input.moduleId },
      include: {
        course: {
          select: { creatorId: true }
        }
      }
    });

    if (!module || module.course.creatorId !== input.creatorId) {
      throw new Error('Module not found or access denied');
    }

    const lesson = await database.lesson.create({
      data: {
        title: input.title,
        description: input.description,
        content: input.content,
        type: input.type,
        moduleId: input.moduleId,
        order: input.order,
        estimatedDuration: input.estimatedDuration,
        videoUrl: input.videoUrl,
        videoDuration: input.videoDuration,
      }
    });

    return lesson;
  }),

getModuleLessons: publicProcedure
  .input(z.object({
    moduleId: z.string(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    const lessons = await database.lesson.findMany({
      where: { moduleId: input.moduleId },
      orderBy: { order: 'asc' }
    });

    return lessons;
  }),

updateModule: publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    order: z.number().int().min(0).optional(),
    creatorId: z.string(),
    userRole: z.string(),
  }))
  .mutation(async ({ input }) => {
    if (input.userRole !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    const database = getDb();
    
    const { id, creatorId, userRole, ...updateData } = input;
    
    // Verify ownership through course
    const module = await database.module.findFirst({
      where: { id },
      include: {
        course: { select: { creatorId: true } }
      }
    });

    if (!module || module.course.creatorId !== creatorId) {
      throw new Error('Module not found or access denied');
    }

    const updatedModule = await database.module.update({
      where: { id },
      data: updateData,
    });

    return updatedModule;
  }),

deleteModule: publicProcedure
  .input(z.object({
    id: z.string(),
    creatorId: z.string(),
    userRole: z.string(),
  }))
  .mutation(async ({ input }) => {
    if (input.userRole !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    const database = getDb();
    
    // Verify ownership through course
    const module = await database.module.findFirst({
      where: { id: input.id },
      include: {
        course: { select: { creatorId: true } }
      }
    });

    if (!module || module.course.creatorId !== input.creatorId) {
      throw new Error('Module not found or access denied');
    }

    const deletedModule = await database.module.delete({
      where: { id: input.id },
    });

    return deletedModule;
  }),

	// Student course access procedures
getCourseForStudent: publicProcedure
  .input(z.object({
    courseId: z.string(),
    userId: z.string().optional(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    // Get course with modules and lessons
    const course = await database.course.findUnique({
      where: { 
        id: input.courseId,
        published: true // Only published courses
      },
      include: {
        creator: {
          select: { name: true }
        },
        category: {
          select: { name: true, color: true }
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                order: true,
                estimatedDuration: true,
                // Don't include content/videoUrl yet - we'll load that separately for security
              }
            }
          }
        }
      }
    });

    if (!course) {
      throw new Error('Course not found or not published');
    }

    // If user provided, check enrollment
    let enrollment = null;
    if (input.userId) {
      enrollment = await database.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: input.userId,
            courseId: input.courseId
          }
        }
      });
    }

    return {
      course,
      isEnrolled: !!enrollment,
      enrollment
    };
  }),

getLessonContent: publicProcedure
  .input(z.object({
    lessonId: z.string(),
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    // Verify user is enrolled in the course containing this lesson
    const lesson = await database.lesson.findUnique({
      where: { id: input.lessonId },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const enrollment = await database.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: input.userId,
          courseId: lesson.module.course.id
        }
      }
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this course');
    }

    // Get or create lesson progress
    const progress = await database.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: input.userId,
          lessonId: input.lessonId
        }
      },
      update: {},
      create: {
        userId: input.userId,
        lessonId: input.lessonId,
        completed: false,
        watchTime: 0
      }
    });

    return {
      lesson,
      progress
    };
  }),

markLessonComplete: publicProcedure
  .input(z.object({
    lessonId: z.string(),
    userId: z.string(),
    watchTime: z.number().int().min(0).optional(),
  }))
  .mutation(async ({ input }) => {
    const database = getDb();
    
    // Update lesson progress
    const progress = await database.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: input.userId,
          lessonId: input.lessonId
        }
      },
      update: {
        completed: true,
        completedAt: new Date(),
        watchTime: input.watchTime || 0
      },
      create: {
        userId: input.userId,
        lessonId: input.lessonId,
        completed: true,
        completedAt: new Date(),
        watchTime: input.watchTime || 0
      }
    });

    // Update enrollment progress
    const lesson = await database.lesson.findUnique({
      where: { id: input.lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (lesson) {
      const totalLessons = lesson.module.course.modules.reduce(
        (total, module) => total + module.lessons.length, 0
      );

      const completedLessons = await database.lessonProgress.count({
        where: {
          userId: input.userId,
          completed: true,
          lesson: {
            module: {
              courseId: lesson.module.course.id
            }
          }
        }
      });

      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      await database.enrollment.update({
        where: {
          userId_courseId: {
            userId: input.userId,
            courseId: lesson.module.course.id
          }
        },
        data: {
          progress: progressPercentage,
          lastAccessedAt: new Date(),
          completedAt: progressPercentage >= 100 ? new Date() : null
        }
      });
    }

    return progress;
  }),

getUserCourseProgress: publicProcedure
  .input(z.object({
    courseId: z.string(),
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    const database = getDb();
    
    const lessonProgress = await database.lessonProgress.findMany({
      where: {
        userId: input.userId,
        lesson: {
          module: {
            courseId: input.courseId
          }
        }
      },
      include: {
        lesson: {
          select: { id: true, moduleId: true }
        }
      }
    });

    return lessonProgress;
  }),

	
});

export type AppRouter = typeof appRouter;