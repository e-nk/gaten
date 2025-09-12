import { router, publicProcedure } from './trpc';
import { PrismaClient } from '@prisma/client'; // Now uses default location

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
      await database.$queryRaw`SELECT 1`;
      return { 
        status: 'tRPC is working!', 
        database: 'Connected' 
      };
    } catch (error) {
      return { 
        status: 'tRPC is working!', 
        database: 'Disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }),
});

export type AppRouter = typeof appRouter;