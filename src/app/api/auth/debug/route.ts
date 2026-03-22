export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  // Test Google OIDC discovery
  let oidcStatus = "NOT TESTED";
  try {
    const res = await fetch("https://accounts.google.com/.well-known/openid-configuration", {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      oidcStatus = `OK - authorization_endpoint: ${data.authorization_endpoint}`;
    } else {
      oidcStatus = `FAILED - status: ${res.status}`;
    }
  } catch (e: any) {
    oidcStatus = `ERROR: ${e.message}`;
  }

  const googleId = process.env.GOOGLE_CLIENT_ID || "";
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const authSecret = process.env.AUTH_SECRET || "";
  const nextauthSecret = process.env.NEXTAUTH_SECRET || "";

  return new Response(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      oidcDiscovery: oidcStatus,
      env: {
        GOOGLE_CLIENT_ID_length: googleId.length,
        GOOGLE_CLIENT_ID_prefix: googleId.substring(0, 15),
        GOOGLE_CLIENT_SECRET_length: googleSecret.length,
        AUTH_SECRET_length: authSecret.length,
        AUTH_SECRET_first5: authSecret.substring(0, 5),
        NEXTAUTH_SECRET_length: nextauthSecret.length,
        NEXTAUTH_SECRET_first5: nextauthSecret.substring(0, 5),
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "MISSING",
      },
    }),
    { headers: { "content-type": "application/json" } }
  );
}
