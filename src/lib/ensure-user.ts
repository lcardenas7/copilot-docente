import { db } from "@/lib/db";

/**
 * Ensures the authenticated user exists in the database.
 * Since we use JWT sessions (no PrismaAdapter), users are NOT auto-synced to DB.
 * This function upserts the user record on first API call.
 * Returns the database user ID (cuid), which may differ from the Google sub ID.
 */
export async function ensureUser(session: {
  user?: { id?: string; email?: string; name?: string; image?: string };
}): Promise<string | null> {
  if (!session?.user?.email) return null;

  try {
    const user = await db.user.upsert({
      where: { email: session.user.email },
      update: {
        name: session.user.name || undefined,
        image: session.user.image || undefined,
      },
      create: {
        email: session.user.email,
        name: session.user.name || "Docente",
        image: session.user.image,
        role: "TEACHER",
        plan: "FREE",
      },
      select: { id: true },
    });

    return user.id;
  } catch (error) {
    console.error("ensureUser error:", error);
    return null;
  }
}
