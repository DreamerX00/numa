import { PrismaClient } from "@prisma/client";

// Prevent multiple instances during hot-reload in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log errors and warnings in development to reduce console noise
    // Set to ["query", "error", "warn"] if you need to debug database queries
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Optimize for serverless environments
    ...((process.env.NODE_ENV === "production" || process.env.VERCEL) && {
      // Reduce connection pool size for serverless
      // This helps with MongoDB Atlas connection limits
    })
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Helper function to handle database disconnection
export async function disconnect() {
  await prisma.$disconnect();
}
