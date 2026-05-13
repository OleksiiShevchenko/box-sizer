import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { getPlanForTier } from "@/lib/subscription-plans";
import { onCreateUser, onSignIn } from "@/lib/auth-events";
import { authorizeCredentials } from "@/lib/auth-credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }

      if ((user || trigger === "update") && token.id) {
        const subscription = await prisma.subscription.findUnique({
          where: { userId: token.id as string },
          select: { tier: true },
        });

        token.tier = getPlanForTier(subscription?.tier).tier;
      }

      if (!token.tier) {
        token.tier = "starter";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.tier = token.tier ?? "starter";
      }
      return session;
    },
  },
  events: {
    createUser: onCreateUser,
    signIn: onSignIn,
  },
});
