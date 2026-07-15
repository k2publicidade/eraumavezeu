"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";

const schema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().min(2).max(100).transform((value) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "")),
  title: z.string().trim().min(3).max(140),
  eyebrow: z.string().trim().max(80).optional(),
  summary: z.string().trim().max(500).optional(),
  body: z.string().trim().min(10, "Adicione o conteúdo da página."),
  heroImage: z.union([z.string().url(), z.literal("")]).optional(),
  ctaLabel: z.string().trim().max(60).optional(),
  ctaHref: z.string().trim().max(300).optional(),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(170).optional(),
  published: z.boolean(),
});

export type PageActionResult = { ok: true; id?: string } | { ok: false; error: string };

const RESERVED_SLUGS = new Set(["admin", "api", "login", "cadastro", "produtos", "pedidos", "pedido", "carrinho", "checkout", "personalizar"]);

export async function saveContentPage(input: unknown): Promise<PageActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const { id, ...value } = parsed.data;
  if (RESERVED_SLUGS.has(value.slug)) return { ok: false, error: "Esta URL é reservada pelo sistema." };
  if (value.ctaHref && !/^(\/|https?:\/\/)/i.test(value.ctaHref)) return { ok: false, error: "O destino do botão deve começar com /, http:// ou https://." };
  const data = {
    ...value,
    eyebrow: value.eyebrow || null,
    summary: value.summary || null,
    heroImage: value.heroImage || null,
    ctaLabel: value.ctaLabel || null,
    ctaHref: value.ctaHref || null,
    seoTitle: value.seoTitle || null,
    seoDescription: value.seoDescription || null,
    publishedAt: value.published ? new Date() : null,
  };
  try {
    const page = id
      ? await db.contentPage.update({ where: { id }, data, select: { id: true } })
      : await db.contentPage.create({ data, select: { id: true } });
    revalidatePath("/admin/paginas");
    revalidatePath(`/${value.slug}`);
    return { ok: true, id: page.id };
  } catch (error) {
    console.error("saveContentPage failed", error);
    return { ok: false, error: "Não foi possível salvar. Verifique se a URL já está em uso." };
  }
}

export async function deleteContentPage(id: string): Promise<PageActionResult> {
  await requireAdmin();
  const page = await db.contentPage.findUnique({ where: { id }, select: { slug: true } });
  if (!page) return { ok: false, error: "Página não encontrada." };
  await db.contentPage.delete({ where: { id } });
  revalidatePath("/admin/paginas");
  revalidatePath(`/${page.slug}`);
  return { ok: true };
}
