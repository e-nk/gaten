import { PrismaClient } from './generated/client';

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Export types for use in other packages
export * from './generated/client';
export type { User, Course, Enrollment, Module, Lesson, Review } from './generated/client';