"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type AdminProductResult = { ok: true } | { ok: false; error: string };

async function isAdmin() {
  const session = await auth().catch(() => null);
  return !!session?.user?.id && session.user.role === "ADMIN";
}

const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(20).max(2500),
  price: z.coerce.number().positive().max(9999),
  priceOld: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().positive().max(9999).optional(),
  ),
  active: z.boolean(),
});

export async function updateProduct(input: unknown): Promise<AdminProductResult> {
  if (!(await isAdmin())) return { ok: false, error: "Acesso negado." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados do produto inválidos." };

  const { id, name, description, price, priceOld, active } = parsed.data;

  try {
    await db.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        priceOld: priceOld ?? null,
        active,
      },
    });
  } catch (error) {
    console.error("updateProduct failed", error);
    return { ok: false, error: "Não foi possível salvar o produto." };
  }

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${id}`);
  revalidatePath("/produtos");
  revalidatePath("/");
  return { ok: true };
}
