"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { DEFAULT_FAQ_ITEMS, SITE_SETTING_FIELDS } from "@/lib/site-content";

const settingKeys = SITE_SETTING_FIELDS.map((field) => field.key) as [string, ...string[]];

const settingsSchema = z.object(
  Object.fromEntries(
    SITE_SETTING_FIELDS.map((field) => [field.key, z.string().trim().min(1, `${field.label} é obrigatório`)]),
  ) as Record<(typeof settingKeys)[number], z.ZodString>,
);

const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().trim().min(3, "Pergunta muito curta"),
  answer: z.string().trim().min(3, "Resposta muito curta"),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  active: z.coerce.boolean().default(false),
});

function revalidateContentPaths() {
  revalidatePath("/");
  revalidatePath("/contato");
  revalidatePath("/faq");
  revalidatePath("/admin/conteudo");
}

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(SITE_SETTING_FIELDS.map((field) => [field.key, formData.get(field.key)]));
  const parsed = settingsSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos");
  }

  await db.$transaction(
    SITE_SETTING_FIELDS.map((field) =>
      db.siteSetting.upsert({
        where: { key: field.key },
        create: {
          key: field.key,
          value: parsed.data[field.key],
          label: field.label,
          type: field.type,
        },
        update: {
          value: parsed.data[field.key],
          label: field.label,
          type: field.type,
        },
      }),
    ),
  );

  revalidateContentPaths();
}

export async function saveFaqItem(formData: FormData) {
  await requireAdmin();

  const parsed = faqSchema.safeParse({
    id: formData.get("id")?.toString() || undefined,
    question: formData.get("question"),
    answer: formData.get("answer"),
    sortOrder: formData.get("sortOrder"),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "FAQ inválida");
  }

  const { id, ...data } = parsed.data;

  if (id) {
    await db.faqItem.update({ where: { id }, data });
  } else {
    await db.faqItem.create({ data });
  }

  revalidateContentPaths();
}

export async function toggleFaqItem(id: string, active: boolean) {
  await requireAdmin();

  await db.faqItem.update({ where: { id }, data: { active } });
  revalidateContentPaths();
}

export async function deleteFaqItem(id: string) {
  await requireAdmin();

  await db.faqItem.delete({ where: { id } });
  revalidateContentPaths();
}

export async function seedDefaultFaqItems() {
  await requireAdmin();

  await db.$transaction(
    DEFAULT_FAQ_ITEMS.map((item) =>
      db.faqItem.upsert({
        where: { id: item.id },
        create: item,
        update: {
          question: item.question,
          answer: item.answer,
          sortOrder: item.sortOrder,
          active: item.active,
        },
      }),
    ),
  );

  revalidateContentPaths();
}
