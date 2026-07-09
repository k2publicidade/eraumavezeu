"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function getAdminUser() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session.user;
}

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .transform((s) => s.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive("O valor deve ser maior que zero"),
  maxUses: z.number().int().nonnegative().nullable().optional(),
  expiresAt: z.string().trim().optional().nullable(),
});

export async function createCoupon(input: unknown): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Acesso negado." };

  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Dados inválidos.";
    return { ok: false, error: errorMsg };
  }

  const { code, type, value, maxUses, expiresAt } = parsed.data;

  try {
    const exists = await db.coupon.findUnique({ where: { code } });
    if (exists) {
      return { ok: false, error: "Já existe um cupom cadastrado com este código." };
    }

    await db.coupon.create({
      data: {
        code,
        type,
        value,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    revalidatePath("/admin/cupons");
    return { ok: true };
  } catch (err) {
    console.error("createCoupon failed", err);
    return { ok: false, error: "Erro interno ao cadastrar cupom." };
  }
}

export async function toggleCouponActive(
  couponId: string,
  active: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Acesso negado." };

  try {
    await db.coupon.update({
      where: { id: couponId },
      data: { active },
    });

    revalidatePath("/admin/cupons");
    return { ok: true };
  } catch (err) {
    console.error("toggleCouponActive failed", err);
    return { ok: false, error: "Erro interno ao alterar status do cupom." };
  }
}

export async function deleteCoupon(couponId: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Acesso negado." };

  try {
    await db.coupon.delete({
      where: { id: couponId },
    });

    revalidatePath("/admin/cupons");
    return { ok: true };
  } catch (err) {
    console.error("deleteCoupon failed", err);
    return { ok: false, error: "Não foi possível excluir o cupom pois ele já pode estar associado a pedidos." };
  }
}

export type ValidateCouponResult =
  | {
      ok: true;
      coupon: {
        id: string;
        code: string;
        type: "PERCENTAGE" | "FIXED";
        value: number;
        discountAmount: number;
      };
    }
  | { ok: false; error: string };

export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<ValidateCouponResult> {
  if (!code || typeof code !== "string") {
    return { ok: false, error: "Código do cupom inválido." };
  }

  const formattedCode = code.trim().toUpperCase();

  try {
    const coupon = await db.coupon.findUnique({
      where: { code: formattedCode },
    });

    if (!coupon) {
      return { ok: false, error: "Cupom não encontrado." };
    }

    if (!coupon.active) {
      return { ok: false, error: "Este cupom não está mais ativo." };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { ok: false, error: "Este cupom já expirou." };
    }

    if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) {
      return { ok: false, error: "Este cupom atingiu o limite de usos." };
    }

    // Calculo do desconto
    let discountAmount = 0;
    const valueNum = Number(coupon.value);

    if (coupon.type === "PERCENTAGE") {
      discountAmount = Math.round(subtotal * (valueNum / 100) * 100) / 100;
    } else {
      discountAmount = valueNum;
    }

    // O desconto do cupom não pode ultrapassar o subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return {
      ok: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: valueNum,
        discountAmount,
      },
    };
  } catch (err) {
    console.error("validateCoupon failed", err);
    return { ok: false, error: "Erro ao validar cupom." };
  }
}
