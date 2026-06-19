"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { productActionSchema } from "@/lib/admin/products";

export type AdminProductResult =
  | { ok: true; id?: string; message?: string }
  | { ok: false; error: string };

async function isAdmin() {
  const session = await auth().catch(() => null);
  return !!session?.user?.id && session.user.role === "ADMIN";
}

function revalidateProductSurfaces(id?: string) {
  revalidatePath("/admin/produtos");
  if (id) revalidatePath(`/admin/produtos/${id}`);
  revalidatePath("/produtos");
  revalidatePath("/carrinho");
  revalidatePath("/");
}

async function buildUniqueSlug(slug: string, currentId?: string) {
  let candidate = slug;
  let suffix = 2;

  while (true) {
    const existing = await db.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) return candidate;
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
}

export async function createProduct(input: unknown): Promise<AdminProductResult> {
  if (!(await isAdmin())) return { ok: false, error: "Acesso negado." };

  const parsed = productActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados do produto inválidos." };

  const data = parsed.data;

  try {
    const product = await db.product.create({
      data: {
        slug: await buildUniqueSlug(data.slug),
        name: data.name,
        description: data.description,
        price: data.price,
        priceOld: data.priceOld ?? null,
        type: data.type,
        active: data.active,
        images: data.images,
      },
      select: { id: true },
    });

    revalidateProductSurfaces(product.id);
    return { ok: true, id: product.id, message: "Produto cadastrado com sucesso." };
  } catch (error) {
    console.error("createProduct failed", error);
    return { ok: false, error: "Não foi possível cadastrar o produto." };
  }
}

export async function updateProduct(input: unknown): Promise<AdminProductResult> {
  if (!(await isAdmin())) return { ok: false, error: "Acesso negado." };

  const parsed = productActionSchema.safeParse(input);
  if (!parsed.success || !parsed.data.id) {
    return { ok: false, error: parsed.success ? "Produto não informado." : parsed.error.issues[0]?.message ?? "Dados do produto inválidos." };
  }

  const data = parsed.data;

  try {
    await db.product.update({
      where: { id: data.id },
      data: {
        slug: await buildUniqueSlug(data.slug, data.id),
        name: data.name,
        description: data.description,
        price: data.price,
        priceOld: data.priceOld ?? null,
        type: data.type,
        active: data.active,
        images: data.images,
      },
    });
  } catch (error) {
    console.error("updateProduct failed", error);
    return { ok: false, error: "Não foi possível salvar o produto." };
  }

  revalidateProductSurfaces(data.id);
  return { ok: true, id: data.id, message: "Produto salvo com sucesso." };
}

export async function deleteProduct(id: string): Promise<AdminProductResult> {
  if (!(await isAdmin())) return { ok: false, error: "Acesso negado." };
  if (!id) return { ok: false, error: "Produto não informado." };

  try {
    const orderItems = await db.orderItem.count({ where: { productId: id } });

    if (orderItems > 0) {
      await db.product.update({ where: { id }, data: { active: false } });
      revalidateProductSurfaces(id);
      return {
        ok: true,
        id,
        message: "Produto possui pedidos vinculados e foi desativado para preservar o histórico.",
      };
    }

    await db.product.delete({ where: { id } });
    revalidateProductSurfaces(id);
    return { ok: true, message: "Produto excluído com sucesso." };
  } catch (error) {
    console.error("deleteProduct failed", error);
    return { ok: false, error: "Não foi possível excluir o produto." };
  }
}
