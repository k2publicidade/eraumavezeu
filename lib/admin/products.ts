import { z } from "zod";
import type { ProductType } from "@prisma/client";

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  LIVRO_PRINCIPAL: "Livro principal",
  EBOOK: "E-book",
  LIVRO_COLORIR: "Livro de colorir",
  QUEBRA_CABECA: "Quebra-cabeça",
  CARTELA_ADESIVOS: "Cartela de adesivos",
};

export const PRODUCT_TYPE_OPTIONS = Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => ({
  value: value as ProductType,
  label,
}));

export function buildProductSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseImageLines(value: unknown) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (value === "on" || value === "true" || value === "1") return true;
  return false;
}

function emptyToUndefined(value: unknown) {
  return value === "" || value === null ? undefined : value;
}

const productTypeValues = Object.keys(PRODUCT_TYPE_LABELS) as [ProductType, ...ProductType[]];

export const productActionSchema = z
  .object({
    id: z.string().min(1).optional(),
    name: z.string().trim().min(2, "Informe o nome do produto.").max(120),
    slug: z.preprocess(emptyToUndefined, z.string().trim().max(90).optional()),
    description: z.string().trim().min(20, "Descrição deve ter ao menos 20 caracteres.").max(2500),
    price: z.coerce.number().positive("Preço deve ser maior que zero.").max(9999),
    priceOld: z.preprocess(emptyToUndefined, z.coerce.number().positive().max(9999).optional()),
    type: z.enum(productTypeValues),
    active: z.preprocess(parseBoolean, z.boolean()),
    imagesText: z.unknown().optional(),
  })
  .transform((value) => ({
    ...value,
    slug: buildProductSlug(value.slug || value.name),
    price: Number(value.price.toFixed(2)),
    priceOld: value.priceOld ? Number(value.priceOld.toFixed(2)) : undefined,
    images: parseImageLines(value.imagesText),
  }))
  .refine((value) => value.slug.length > 0, {
    path: ["slug"],
    message: "Informe um slug válido.",
  });

export type ProductActionInput = z.infer<typeof productActionSchema>;
