export const dynamic = "force-dynamic";
export async function GET() {
  return new Response(
    JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      runtime: "edge",
      env: {
        NODE_ENV: process.env.NODE_ENV,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "MISSING",
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "MISSING",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "MISSING",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING",
        AUTH_SECRET: process.env.AUTH_SECRET ? "SET" : "MISSING",
        DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
      },
    }),
    { headers: { "content-type": "application/json" } }
  );
}
