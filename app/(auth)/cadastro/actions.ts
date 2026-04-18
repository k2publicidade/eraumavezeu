"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { signupSchema } from "@/lib/validators/auth";

export type SignupActionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Cria uma nova conta com role=CUSTOMER e senha bcrypt (10 rounds).
 * - Valida payload com Zod antes de qualquer operação.
 * - Checa colisão de e-mail explicitamente — evita depender só do UNIQUE constraint
 *   do Prisma, que lança erro opaco.
 * - Faz auto-login pós-criação para reduzir fricção; se falhar, a conta já foi
 *   criada e o UI redireciona para /login.
 * - password NUNCA sai do servidor e NUNCA vai para o JWT (mitigação T-00-12).
 */
export async function createAccount(
  formData: FormData
): Promise<SignupActionResult> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Já existe uma conta com esse e-mail" };
  }

  const hash = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      name,
      email,
      password: hash,
      role: "CUSTOMER",
    },
  });

  // Auto-login pós-cadastro (best-effort). Qualquer falha é ignorada —
  // a conta já existe e o client pode redirecionar para /login.
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    // no-op
  }

  return { ok: true };
}
