import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      // Hier schieben wir die Profil-Daten von der Datenbank in die Session
      if (session.user) {
        // @ts-expect-error: next-auth session user extended at runtime
        session.user.id = user.id;
        session.user.email = user.email || "";
        session.user.name = user.name || "";
        session.user.image = user.image || "";
        // @ts-expect-error: next-auth session user extended at runtime
        session.user.backgroundImage = user.backgroundImage;
        // @ts-expect-error: next-auth session user extended at runtime
        session.user.username = user.username;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Immer erlauben
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };