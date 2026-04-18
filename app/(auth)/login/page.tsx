import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  // Google só aparece quando credenciais OAuth estão configuradas.
  // Sem isso, o botão levaria a /api/auth/signin/google que falharia no Auth.js.
  const googleEnabled = !!process.env.AUTH_GOOGLE_ID;
  return <LoginForm googleEnabled={googleEnabled} />;
}
