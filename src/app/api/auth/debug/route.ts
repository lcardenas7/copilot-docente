export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  return new Response(
    JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "Use /api/health instead",
    }),
    { headers: { "content-type": "application/json" } }
  );
}
