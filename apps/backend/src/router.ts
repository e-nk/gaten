import { router, publicProcedure } from './trpc';
import { PrismaClient } from '@prisma/client';

let db: PrismaClient | null = null;

const getDb = () => {
  if (!db) {
    db = new PrismaClient();
  }
  return db;
};

export const appRouter = router({
  healthCheck: publicProcedure.query(async () => {
    try {
      const database = getDb();
      
      // Test database connection with our new schema
      await database.$queryRaw`SELECT 1`;
      
      // Get counts of main tables to verify schema
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

  // Test procedure to create a sample category
  createSampleData: publicProcedure.mutation(async () => {
    try {
      const database = getDb();
      
      // Create sample category if it doesn't exist
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
  })
});

export type AppRouter = typeof appRouter;