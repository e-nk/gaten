import { router, publicProcedure } from './trpc';
import { db } from '@gaten/db';

export const appRouter = router({
  // Health check with database connection test
  healthCheck: publicProcedure.query(async () => {
    try {
      // Test database connection
      await db.$queryRaw`SELECT 1`;
      return { 
        status: 'tRPC is working!', 
        database: 'Connected' 
      };
    } catch (error) {
      return { 
        status: 'tRPC is working!', 
        database: 'Disconnected - will connect when deployed' 
      };
    }
  }),
});

export type AppRouter = typeof appRouter;