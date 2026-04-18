import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Middleware edge-safe (não importa Prisma nem bcrypt — só JWT)
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: [
    // Proteger tudo exceto assets públicos, api/auth e api/webhook
    "/((?!api/auth|api/webhook|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
