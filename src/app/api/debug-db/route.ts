import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Test 1: Check if env vars are present
    const envCheck = {
      hasAccelerateUrl: !!process.env.PRISMA_ACCELERATE_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
    };

    // Test 2: Try a simple DB query with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('DB query timeout after 5s')), 5000)
    );

    const dbPromise = db.user.findFirst({
      select: { id: true, email: true },
      take: 1,
    });

    const result = await Promise.race([dbPromise, timeoutPromise]);

    return NextResponse.json({
      success: true,
      env: envCheck,
      dbResult: result ? 'connected' : 'no_users',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'unknown',
      env: {
        hasAccelerateUrl: !!process.env.PRISMA_ACCELERATE_URL,
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
