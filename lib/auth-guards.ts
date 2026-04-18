import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Garante que há usuário logado. Redireciona para /login se não houver.
 * Usar em Server Components / Server Actions / Route Handlers.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
}

/**
 * Garante que o usuário logado é ADMIN. Retorna notFound() para não-admins
 * (comportamento intencional: esconder a existência do painel).
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    notFound();
  }
  return session.user;
}
