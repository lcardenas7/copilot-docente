import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};

function createPrismaClient() {
  // Use Prisma Accelerate (HTTP-based) — no TCP sockets, no pg pool hangs
  return new PrismaClient({
    accelerateUrl: process.env.PRISMA_ACCELERATE_URL,
  }).$extends(withAccelerate());
}

function getDb() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy proxy: PrismaClient is only created on first property access (not at import time)
// This prevents build errors when PRISMA_ACCELERATE_URL is not yet set
export const db: any = new Proxy(
  {},
  {
    get(_target, prop) {
      if (typeof prop === "symbol") return undefined;
      return getDb()[prop];
    },
  }
);
