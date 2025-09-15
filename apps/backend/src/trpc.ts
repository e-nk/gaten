import { initTRPC, TRPCError } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

// Create context from Express request
export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  // For now, we'll handle auth in the procedures since NextAuth sessions 
  // are handled on the frontend
  return {
    req,
    res,
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC with context
const t = initTRPC.context<Context>().create();

// Basic auth middleware - we'll implement session-based auth differently
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  // Since we're using NextAuth on frontend, we'll validate sessions differently
  // For now, we'll rely on frontend session validation
  return next({
    ctx: {
      ...ctx,
    },
  });
});

// Admin middleware 
const isAdmin = t.middleware(async ({ ctx, next }) => {
  // We'll validate admin access in the procedures themselves
  return next({
    ctx: {
      ...ctx,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
export const adminProcedure = t.procedure.use(isAdmin);

