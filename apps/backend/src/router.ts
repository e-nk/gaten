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
    }))
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
});

export type AppRouter = typeof appRouter;