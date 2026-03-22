import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const response = await handlers.GET(request);
    
    // Intercept error redirects and show actual error for debugging
    if (response.status === 302) {
      const location = response.headers.get("location") || "";
      if (location.includes("error=")) {
        // Return error as JSON for debugging
        return new Response(
          JSON.stringify({
            intercepted: true,
            redirect: location,
            message: "NextAuth tried to redirect to error page",
          }),
          { status: 500, headers: { "content-type": "application/json" } }
        );
      }
    }
    
    return response;
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message,
        name: error.name,
        stack: error.stack?.split("\n").slice(0, 5),
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handlers.POST(request);
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message,
        name: error.name,
        stack: error.stack?.split("\n").slice(0, 5),
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
