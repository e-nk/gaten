import { initTRPC, TRPCError } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import jwt from 'jsonwebtoken';

// Create context from Express request
export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  // Extract token from Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  return {
    req,
    res,
    token,
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC with context
const t = initTRPC.context<Context>().create();

// Auth middleware
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  try {
    // For NextAuth JWT tokens, we'd verify the JWT here
    // For now, we'll implement a basic check
    const decoded = jwt.verify(ctx.token, process.env.NEXTAUTH_SECRET || 'fallback-secret');
    
    return next({
      ctx: {
        ...ctx,
        user: decoded as any, // We'll type this properly later
      },
    });
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid token',
    });
  }
});

// Admin-only middleware
const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    });
  }

  // Check if user is admin (we'll implement proper role checking)
  const user = ctx.user as any;
  if (user?.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
export const adminProcedure = t.procedure.use(isAdmin);