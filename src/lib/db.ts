import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Create pg Pool explicitly for better control and error handling
  const pool = new Pool({
    connectionString,
    max: 2,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 10000,
    // Always use SSL for Supabase (required even in preview deploys)
    ssl: { rejectUnauthorized: false },
  });

  // Log pool errors instead of crashing the process
  pool.on("error", (err) => {
    console.error("PG Pool unexpected error:", err.message);
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
