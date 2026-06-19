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
  STATUS_LABELS,
  type OrderStatusValue,
} from "@/lib/orders/status";
import { sendEmail } from "@/lib/email";
import { sendMessage } from "@/lib/whatsapp";
import { statusMessage } from "@/lib/notifications/order-status";

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

const resendNotificationSchema = z.object({
  orderId: z.string().min(1),
  channel: z.enum(["email", "whatsapp"]),
});

export async function resendNotification(
  input: unknown,
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Acesso negado." };

  const parsed = resendNotificationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };
  const { orderId, channel } = parsed.data;

  const order = await db.order.findUnique({
    where: { id: orderId },
  });
  if (!order) return { ok: false, error: "Pedido não encontrado." };

  try {
    const isWhatsapp = channel === "whatsapp";
    if (isWhatsapp && !order.guestPhone) {
      return { ok: false, error: "Este pedido não possui telefone cadastrado." };
    }

    const guestName = order.guestName || "Cliente";
    const guestEmail = order.guestEmail || "";

    if (channel === "email" && !guestEmail) {
      return { ok: false, error: "Este pedido não possui e-mail cadastrado." };
    }

    const firstName = guestName.trim().split(/\s+/)[0] || "cliente";
    const label = STATUS_LABELS[order.status as OrderStatusValue] || order.status;
    const message = statusMessage({
      orderId: order.id,
      orderCode: orderCodeOf(order.id),
      buyerName: guestName,
      buyerEmail: guestEmail,
      buyerPhone: order.guestPhone ?? "",
      whatsappOptIn: order.whatsappOptIn,
      toStatus: order.status as OrderStatusValue,
      trackingCode: order.trackingCode,
    });

    if (channel === "email") {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      const emailRes = await sendEmail({
        to: guestEmail,
        subject: `Pedido #${orderCodeOf(order.id)}: ${label} — Era Uma Vez Eu`,
        html: [
          `<p>Olá, ${firstName}!</p>`,
          `<p>${message}</p>`,
          `<p><a href="${baseUrl}/pedido/${order.id}">Acompanhar pedido #${orderCodeOf(order.id)}</a></p>`,
          `<p>— Era Uma Vez Eu</p>`,
        ].join("\n"),
      });
      if (!emailRes.ok) {
        return { ok: false, error: emailRes.error || "Erro no envio do e-mail." };
      }
    } else {
      const waRes = await sendMessage({
        phone: order.guestPhone!,
        text: `Olá, ${firstName}! 📚 Atualização do pedido #${orderCodeOf(order.id)}:\n\n${message}`,
      });
      if (!waRes.ok) {
        return { ok: false, error: waRes.error || "Erro no envio do WhatsApp." };
      }
    }

    return { ok: true };
  } catch (err) {
    console.error("resendNotification failed", err);
    return { ok: false, error: "Erro interno ao reenviar notificação." };
  }
}

const simulatePaymentSchema = z.object({
  orderId: z.string().min(1),
});

export async function simulatePaymentApproval(
  input: unknown,
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Acesso negado." };

  const parsed = simulatePaymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "ID do pedido inválido." };
  const { orderId } = parsed.data;

  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order) return { ok: false, error: "Pedido não encontrado." };
  if (order.paymentStatus === "APROVADO") {
    return { ok: false, error: "O pagamento deste pedido já está aprovado." };
  }

  try {
    await db.$transaction([
      db.order.update({
        where: { id: orderId },
        data: {
          status: "PAGAMENTO_CONFIRMADO",
          paymentStatus: "APROVADO",
          paymentId: `SIM_MP_${Date.now()}`,
          paymentMethod: "SIMULATION_PAYMENT",
        },
      }),
      db.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: "PAGAMENTO_CONFIRMADO",
          changedBy: admin.id,
          note: "Simulação de pagamento aprovado via Painel Admin",
        },
      }),
    ]);
  } catch (err) {
    console.error("simulatePaymentApproval failed", err);
    return { ok: false, error: "Não foi possível simular a aprovação do pagamento." };
  }

  // Envia notificações ao cliente caso o pagamento tenha sido confirmado
  if (order.guestEmail) {
    await notifyOrderStatusChanged({
      orderId: order.id,
      orderCode: orderCodeOf(order.id),
      buyerName: order.guestName ?? "Cliente",
      buyerEmail: order.guestEmail,
      buyerPhone: order.guestPhone ?? "",
      whatsappOptIn: order.whatsappOptIn && !!order.guestPhone,
      toStatus: "PAGAMENTO_CONFIRMADO",
      trackingCode: order.trackingCode,
    }).catch((err) => console.error("notifyOrderStatusChanged failed during simulation", err));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath(`/pedido/${orderId}`);

  return { ok: true };
}

