import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import type { Adapter } from "next-auth/adapters";

// Validate environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.error("❌ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing!");
  console.error("GOOGLE_CLIENT_ID exists:", !!googleClientId);
  console.error("GOOGLE_CLIENT_SECRET exists:", !!googleClientSecret);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    Google({
      clientId: googleClientId || "",
      clientSecret: googleClientSecret || "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch additional user data
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true, plan: true },
        });
        if (dbUser) {
          (session.user as any).role = dbUser.role;
          (session.user as any).plan = dbUser.plan;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
  },
});
