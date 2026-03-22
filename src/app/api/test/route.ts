// Bare Node.js test endpoint - no external imports
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(
    JSON.stringify({ 
      ok: true, 
      runtime: "nodejs",
      time: new Date().toISOString() 
    }),
    { headers: { "content-type": "application/json" } }
  );
}
