import { z } from "zod";
import {
  AGE_RANGES,
  ART_STYLES,
  COLORS,
  GENRES,
  MAX_PHOTOS,
  THEMES,
} from "@/lib/wizard/types";
import { productCustomizationSchema } from "@/lib/product-customization";

// extrai os slugs dos catálogos do wizard como tuple para z.enum —
// evita drift entre as opções do wizard e a validação do servidor
function slugsOf<T extends readonly { slug: string }[]>(list: T) {
  return list.map((x) => x.slug) as [T[number]["slug"], ...T[number]["slug"][]];
}

export const customizationSnapshotSchema = z.object({
  theme: z.string().trim().min(2).max(100),
  genre: z.enum(slugsOf(GENRES)),
  artStyle: z.enum(slugsOf(ART_STYLES)),
  favoriteColor: z.enum(slugsOf(COLORS)),
  ageRange: z.enum(slugsOf(AGE_RANGES)),
  childName: z.string().trim().min(2).max(60),
  dedication: z.string().max(300).default(""),
  photoKeys: z.array(z.string().regex(/^(?:sb_[A-Za-z0-9_-]+|[A-Za-z0-9._~-]{8,300})$/)).min(1).max(MAX_PHOTOS),
  consentAcceptedAt: z.string().datetime(),
  consentTextVersion: z.string().min(1),
});

export const checkoutItemSchema = z.object({
  slug: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
  customization: customizationSnapshotSchema.optional(),
  customizations: z.array(productCustomizationSchema).max(10).default([]),
});

const onlyDigits = (s: string) => s.replace(/\D/g, "");

function isValidCpf(value: string) {
  const cpf = onlyDigits(value);
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;

  const digit = (length: number) => {
    const sum = cpf
      .slice(0, length)
      .split("")
      .reduce((total, current, index) => total + Number(current) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

export const checkoutSchema = z.object({
  buyer: z.object({
    name: z.string().trim().min(3).max(120),
    email: z.string().trim().email().max(160),
    cpf: z
      .string()
      .transform(onlyDigits)
      .refine(isValidCpf, "CPF inválido"),
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
  shippingMethod: z.string().optional(),
  shippingCost: z.number().optional(),
  paymentGateway: z.enum(["MERCADOPAGO", "SIMULADO"]).default("MERCADOPAGO"),
  couponCode: z.string().trim().max(30).optional(),
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;
export type CustomizationPayload = z.infer<typeof customizationSnapshotSchema>;
