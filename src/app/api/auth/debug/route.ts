import { NextResponse } from "next/server";

export async function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    config: {
      GOOGLE_CLIENT_ID: googleClientId ? `${googleClientId.substring(0, 20)}...` : "❌ MISSING",
      GOOGLE_CLIENT_SECRET: googleClientSecret ? "✅ SET (hidden)" : "❌ MISSING",
      NEXTAUTH_URL: nextAuthUrl || "❌ MISSING",
      NEXTAUTH_SECRET: nextAuthSecret ? "✅ SET (hidden)" : "❌ MISSING",
    },
    clientIdLength: googleClientId?.length || 0,
    clientSecretLength: googleClientSecret?.length || 0,
  });
}
