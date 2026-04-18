import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Config sem Prisma — usada no middleware (edge runtime)
export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      // authorize real fica em lib/auth.ts (precisa do Prisma; runtime Node)
      async authorize() {
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "ADMIN";

      if (nextUrl.pathname.startsWith("/admin")) {
        return isAdmin;
      }
      if (nextUrl.pathname.startsWith("/cliente") || nextUrl.pathname.startsWith("/pedidos") || nextUrl.pathname.startsWith("/perfil")) {
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as "CUSTOMER" | "ADMIN") ?? "CUSTOMER";
        session.user.id = token.sub ?? "";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
