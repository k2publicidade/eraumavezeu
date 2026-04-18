"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { loginSchema } from "@/lib/validators/auth";

export type LoginActionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Server Action que executa sign-in com Credentials provider.
 * - Valida payload com Zod antes de tocar no provider.
 * - Retorna erro genérico ("Credenciais inválidas") para não vazar qual campo falhou
 *   (mitigação T-00-10 — Spoofing via enumeração de e-mails).
 */
export async function loginWithCredentials(
  formData: FormData
): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos" };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirect: false,
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "Credenciais inválidas" };
    }
    throw e;
  }
}
