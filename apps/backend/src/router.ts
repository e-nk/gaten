import { router, publicProcedure, protectedProcedure, adminProcedure } from './trpc';
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
      
      const category = await database.category.upsert({
        where: { slug: 'programming' },
        update: {},
        create: {
          name: 'Programming',
          slug: 'programming',
          description: 'Learn to code',
          icon: '💻',
          color: '#0b1320',
          order: 1
        }
      });

      return {
        success: true,
        category: category
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }),

  // Protected procedures (require authentication)
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const database = getDb();
    const user = await database.user.findUnique({
      where: { id: ctx.user.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        totalPoints: true,
        currentStreak: true,
        createdAt: true,
      }
    });
    
    return user;
  }),

  // Admin-only procedures
  getAllUsers: adminProcedure.query(async () => {
    const database = getDb();
    const users = await database.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            createdCourses: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return users;
  }),

  createCourse: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      categoryId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = getDb();
      
      const course = await database.course.create({
        data: {
          title: input.title,
          description: input.description,
          slug: input.title.toLowerCase().replace(/\s+/g, '-'),
          creatorId: ctx.user.sub,
          categoryId: input.categoryId,
        }
      });
      
      return course;
    }),
});

export type AppRouter = typeof appRouter;