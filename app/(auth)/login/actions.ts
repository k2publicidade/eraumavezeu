"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { getPostLoginRedirect } from "@/lib/auth-redirect";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validators/auth";

export type LoginActionResult =
  | { ok: true; redirectTo: string }
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

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { role: true },
    });

    return { ok: true, redirectTo: getPostLoginRedirect(user?.role) };
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "Credenciais inválidas" };
    }
    throw e;
  }
}
