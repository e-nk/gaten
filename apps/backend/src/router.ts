import { router, publicProcedure } from './trpc';
import { PrismaClient } from '@prisma/client';

// Create Prisma client directly in backend
const db = new PrismaClient();

export const appRouter = router({
  healthCheck: publicProcedure.query(async () => {
    try {
      await db.$queryRaw`SELECT 1`;
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