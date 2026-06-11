import { z } from "zod";
import {
  AGE_RANGES,
  ART_STYLES,
  COLORS,
  GENRES,
  MAX_PHOTOS,
  THEMES,
} from "@/lib/wizard/types";

// extrai os slugs dos catálogos do wizard como tuple para z.enum —
// evita drift entre as opções do wizard e a validação do servidor
function slugsOf<T extends readonly { slug: string }[]>(list: T) {
  return list.map((x) => x.slug) as [T[number]["slug"], ...T[number]["slug"][]];
}

export const customizationSnapshotSchema = z.object({
  theme: z.enum(slugsOf(THEMES)),
  genre: z.enum(slugsOf(GENRES)),
  artStyle: z.enum(slugsOf(ART_STYLES)),
  favoriteColor: z.enum(slugsOf(COLORS)),
  ageRange: z.enum(slugsOf(AGE_RANGES)),
  childName: z.string().trim().min(2).max(60),
  dedication: z.string().max(300).default(""),
  photoKeys: z.array(z.string().min(1)).min(1).max(MAX_PHOTOS),
  consentAcceptedAt: z.string().datetime(),
  consentTextVersion: z.string().min(1),
});

export const checkoutItemSchema = z.object({
  slug: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
  customization: customizationSnapshotSchema.optional(),
});

const onlyDigits = (s: string) => s.replace(/\D/g, "");

export const checkoutSchema = z.object({
  buyer: z.object({
    name: z.string().trim().min(3).max(120),
    email: z.string().trim().email().max(160),
    phone: z
      .string()
      .transform(onlyDigits)
      .pipe(z.string().regex(/^\d{10,11}$/, "Telefone inválido")),
    whatsappOptIn: z.boolean().default(false),
  }),
  address: z.object({
    zipCode: z
      .string()
      .transform(onlyDigits)
      .pipe(z.string().regex(/^\d{8}$/, "CEP inválido")),
    street: z.string().trim().min(2).max(160),
    number: z.string().trim().min(1).max(20),
    complement: z.string().trim().max(80).optional(),
    district: z.string().trim().min(2).max(80),
    city: z.string().trim().min(2).max(80),
    state: z
      .string()
      .trim()
      .transform((s) => s.toUpperCase())
      .pipe(z.string().regex(/^[A-Z]{2}$/, "UF inválida")),
  }),
  items: z.array(checkoutItemSchema).min(1).max(20),
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;
export type CustomizationPayload = z.infer<typeof customizationSnapshotSchema>;
