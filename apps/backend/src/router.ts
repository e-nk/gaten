import { router, publicProcedure } from './trpc'; // Add this import!

export const appRouter = router({
  // All your actual routes will go here when we build them
  // For now, just a health check
  healthCheck: publicProcedure.query(() => {
    return { status: 'tRPC is working!' };
  }),
});

export type AppRouter = typeof appRouter;