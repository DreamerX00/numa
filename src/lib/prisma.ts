import { PrismaClient } from "@prisma/client";

// Prevent multiple instances during hot-reload in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
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
