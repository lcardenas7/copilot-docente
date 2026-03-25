import { NextResponse } from "next/server";

// Minimal endpoint - NO db, NO auth imports
// Tests if Node.js serverless runtime works at all on Vercel
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    runtime: "nodejs",
    nodeVersion: process.version,
    env: process.env.NODE_ENV,
  });
}
