import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const databaseUrl = process.env.DATABASE_URL;

  // Test database connection
  let dbStatus = "❌ NOT TESTED";
  try {
    const pool = new Pool({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false },
    });
    const result = await pool.query("SELECT 1 as test");
    dbStatus = result.rows[0]?.test === 1 ? "✅ CONNECTED" : "⚠️ UNEXPECTED RESULT";
    await pool.end();
  } catch (error: any) {
    dbStatus = `❌ ERROR: ${error.message}`;
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      status: dbStatus,
      urlExists: !!databaseUrl,
      urlPrefix: databaseUrl ? databaseUrl.substring(0, 30) + "..." : "❌ MISSING",
    },
    auth: {
      GOOGLE_CLIENT_ID: googleClientId ? `${googleClientId.substring(0, 20)}...` : "❌ MISSING",
      GOOGLE_CLIENT_SECRET: googleClientSecret ? "✅ SET (hidden)" : "❌ MISSING",
      NEXTAUTH_URL: nextAuthUrl || "❌ MISSING",
      NEXTAUTH_SECRET: nextAuthSecret ? "✅ SET (hidden)" : "❌ MISSING",
      AUTH_SECRET: process.env.AUTH_SECRET ? "✅ SET" : "❌ MISSING",
    },
  });
}
