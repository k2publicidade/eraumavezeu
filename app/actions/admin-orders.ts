"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyOrderStatusChanged } from "@/lib/notifications/order-status";
import { orderCodeOf } from "@/lib/orders/build-order";
import {
  ORDER_STATUSES,
  photosExpireAtFrom,
  type OrderStatusValue,
} from "@/lib/orders/status";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

/**
 * Em server action, requireAdmin (notFound) não serve — retornamos erro.
 * O middleware já bloqueia /admin; isto é defesa em profundidade para a action.
 */
async function getAdminUser() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session.user;
}

const updateStatusSchema = z.object({
  orderId: z.string().min(1),
  toStatus: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(500).optional(),
});

export async function updateOrderStatus(
  input: unknown,
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Acesso negado." };

  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };
  const { orderId, toStatus, note } = parsed.data;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { customization: { select: { id: true } } },
  });
  if (!order) return { ok: false, error: "Pedido não encontrado." };
  if (order.status === toStatus) {
    return { ok: false, error: "O pedido já está nesse status." };
  }

  const delivered = toStatus === "ENTREGUE";
  const deliveredAt = delivered ? new Date() : undefined;

  try {
    await db.$transaction([
      db.order.update({
        where: { id: orderId },
        data: {
          status: toStatus,
          ...(delivered ? { deliveredAt } : {}),
        },
      }),
      db.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus,
          changedBy: admin.id,
          note: note || null,
        },
      }),
      // ENTREGUE inicia o relógio de retenção LGPD das fotos (+90 dias)
      ...(delivered && order.customization
        ? [
            db.customization.update({
              where: { orderId },
              data: { photosExpireAt: photosExpireAtFrom(deliveredAt!) },
            }),
          ]
        : []),
    ]);
  } catch (err) {
    console.error("updateOrderStatus failed", err);
    return { ok: false, error: "Não foi possível atualizar o status." };
  }

  // comunicação é melhor-esforço — status já persistido
  if (order.guestEmail) {
    await notifyOrderStatusChanged({
      orderId: order.id,
      orderCode: orderCodeOf(order.id),
      buyerName: order.guestName ?? "cliente",
      buyerEmail: order.guestEmail,
      buyerPhone: order.guestPhone ?? "",
      whatsappOptIn: order.whatsappOptIn && !!order.guestPhone,
      toStatus: toStatus as OrderStatusValue,
      trackingCode: order.trackingCode,
    }).catch((err) => console.error("notifyOrderStatusChanged failed", err));
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath(`/pedido/${orderId}`);
  return { ok: true };
}

const trackingSchema = z.object({
  orderId: z.string().min(1),
  trackingCode: z.string().trim().min(3).max(60),
});

export async function setTrackingCode(
  input: unknown,
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Acesso negado." };

  const parsed = trackingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Código de rastreio inválido." };
  const { orderId, trackingCode } = parsed.data;

  try {
    await db.order.update({ where: { id: orderId }, data: { trackingCode } });
  } catch (err) {
    console.error("setTrackingCode failed", err);
    return { ok: false, error: "Não foi possível salvar o rastreio." };
  }

  revalidatePath(`/admin/pedidos/${orderId}`);
  return { ok: true };
}
