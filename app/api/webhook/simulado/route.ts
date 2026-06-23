import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SimulatedGateway } from "@/lib/payments/simulado";
import { notifyOrderStatusChanged } from "@/lib/notifications/order-status";
import { orderCodeOf } from "@/lib/orders/build-order";
import type { PaymentStatus, OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const gateway = new SimulatedGateway();
  const result = await gateway.processWebhook(req);

  if (!result.success) {
    return new Response(result.error || "Erro ao processar", { status: 400 });
  }

  const { orderId, paymentId, paymentStatus, orderStatus, paymentMethod } = result;

  if (!orderId || !paymentId || !paymentStatus || !orderStatus) {
    return new Response("Dados incompletos retornados do simulador", { status: 500 });
  }

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return new Response("Pedido não encontrado", { status: 404 });
    }

    const newPaymentStatus: PaymentStatus = paymentStatus;
    const newOrderStatus: OrderStatus = orderStatus;

    if (
      order.paymentId === paymentId &&
      order.paymentStatus === newPaymentStatus &&
      order.status === newOrderStatus
    ) {
      return NextResponse.json({ ok: true, message: "Evento duplicado - já processado" });
    }

    const updatedOrder = await db.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!currentOrder) {
        throw new Error("Pedido não encontrado na transação");
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentId: paymentId,
          paymentStatus: newPaymentStatus,
          status: newOrderStatus,
          paymentMethod: paymentMethod || null,
          statusHistory: {
            create: {
              fromStatus: currentOrder.status,
              toStatus: newOrderStatus,
              changedBy: "webhook_simulado",
              note: `Simulador de Pagamento: status ${paymentStatus} (ID ${paymentId})`,
            },
          },
        },
      });

      return updated;
    });

    if (updatedOrder.status === "PAGAMENTO_CONFIRMADO" && order.status !== "PAGAMENTO_CONFIRMADO") {
      await notifyOrderStatusChanged({
        orderId: updatedOrder.id,
        orderCode: orderCodeOf(updatedOrder.id),
        buyerName: updatedOrder.guestName || "Cliente",
        buyerEmail: updatedOrder.guestEmail || "",
        buyerPhone: updatedOrder.guestPhone || "",
        whatsappOptIn: updatedOrder.whatsappOptIn,
        toStatus: "PAGAMENTO_CONFIRMADO",
      }).catch((err) => {
        console.error("Erro ao notificar cliente sobre pagamento confirmado:", err);
      });
    }

    return NextResponse.json({ ok: true, processed: true });
  } catch (error) {
    console.error(`Erro ao processar webhook simulado para o pedido ${orderId}:`, error);
    return new Response("Erro interno do servidor", { status: 500 });
  }
}
