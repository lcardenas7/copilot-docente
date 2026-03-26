import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + "...",
    steps: {},
  };

  // Step 1: Basic response (no imports)
  results.steps["1_basic"] = { status: "ok", time: Date.now() };

  // Step 2: Test auth import
  try {
    const startAuth = Date.now();
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    results.steps["2_auth"] = {
      status: "ok",
      time: Date.now() - startAuth,
      hasSession: !!session,
      userEmail: session?.user?.email || "none",
    };
  } catch (e: any) {
    results.steps["2_auth"] = { status: "error", error: e.message };
  }

  // Step 3: Test DB import + connection
  try {
    const startDb = Date.now();
    const { db } = await import("@/lib/db");
    results.steps["3_db_import"] = { status: "ok", time: Date.now() - startDb };

    // Step 4: Simple query
    const startQuery = Date.now();
    const userCount = await db.user.count();
    results.steps["4_db_query"] = {
      status: "ok",
      time: Date.now() - startQuery,
      userCount,
    };
  } catch (e: any) {
    results.steps["3_or_4_db"] = {
      status: "error",
      error: e.message,
      stack: e.stack?.substring(0, 500),
    };
  }

  // Step 5: Test ensureUser
  try {
    const startEnsure = Date.now();
    const { auth } = await import("@/lib/auth");
    const { ensureUser } = await import("@/lib/ensure-user");
    const session = await auth();
    const userId = await ensureUser(session as any);
    results.steps["5_ensureUser"] = {
      status: "ok",
      time: Date.now() - startEnsure,
      userId: userId || "null",
    };
  } catch (e: any) {
    results.steps["5_ensureUser"] = { status: "error", error: e.message };
  }

  return NextResponse.json(results);
}
