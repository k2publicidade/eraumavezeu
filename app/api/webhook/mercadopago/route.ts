import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mpPayment, verifyMPSignature } from "@/lib/mercadopago";
import { notifyOrderStatusChanged } from "@/lib/notifications/order-status";
import { orderCodeOf } from "@/lib/orders/build-order";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  
  // Mercado Pago pode enviar dados no query param ou no body
  let dataId = url.searchParams.get("data.id") || url.searchParams.get("id");
  let topic = url.searchParams.get("type") || url.searchParams.get("topic");

  if (!dataId) {
    try {
      const body = await req.json();
      dataId = body.data?.id || body.id;
      topic = body.type || body.topic || body.action;
    } catch (e) {
      // Ignorar erro se não houver body formatado como JSON
    }
  }

  // Se o tópico não for de pagamento ou se não houver ID do pagamento, retorna 200 para cessar retentativas
  // Nota: Mercado Pago envia ações como "payment.created", "payment.updated". O topic ou type pode vir como "payment".
  const isPaymentEvent = topic === "payment" || (typeof topic === "string" && topic.startsWith("payment"));
  if (!isPaymentEvent || !dataId) {
    return NextResponse.json({ ok: true, message: "Ignorado - não é evento de pagamento" });
  }

  // Verifica a assinatura HMAC para segurança contra requisições falsificadas
  const signatureVerified = verifyMPSignature(req.headers, dataId);
  if (!signatureVerified) {
    console.error(`Tentativa de webhook não assinada ou com assinatura inválida para o pagamento ${dataId}`);
    return new Response("Assinatura inválida", { status: 401 });
  }

  try {
    // Consulta os detalhes do pagamento na API do Mercado Pago
    const payment = await mpPayment.get({ id: dataId });
    const orderId = payment.external_reference;

    if (!orderId) {
      console.warn(`Pagamento ${dataId} não possui external_reference.`);
      return NextResponse.json({ ok: true, message: "Ignorado - sem external_reference" });
    }

    // Busca o pedido no banco de dados
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error(`Pedido ${orderId} associado ao pagamento ${dataId} não foi encontrado.`);
      return new Response("Pedido não encontrado", { status: 404 });
    }

    const mpStatus = payment.status;
    let newPaymentStatus: PaymentStatus = "PENDENTE";
    let newOrderStatus: OrderStatus = order.status;

    if (mpStatus === "approved") {
      newPaymentStatus = "APROVADO";
      newOrderStatus = "PAGAMENTO_CONFIRMADO";
    } else if (mpStatus === "rejected") {
      newPaymentStatus = "REJEITADO";
    } else if (mpStatus === "refunded") {
      newPaymentStatus = "REEMBOLSADO";
    } else if (mpStatus === "cancelled") {
      newPaymentStatus = "REJEITADO";
      newOrderStatus = "CANCELADO";
    }

    // Evita atualizações redundantes se o status já for o mesmo (Idempotência)
    if (
      order.paymentId === String(payment.id) &&
      order.paymentStatus === newPaymentStatus &&
      order.status === newOrderStatus
    ) {
      return NextResponse.json({ ok: true, message: "Evento duplicado - já processado" });
    }

    // Executa a atualização do status em uma transação do banco de dados
    const updatedOrder = await db.$transaction(async (tx) => {
      // Re-busca o pedido dentro da transação para evitar condições de corrida
      const currentOrder = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!currentOrder) {
        throw new Error("Pedido não encontrado na transação");
      }

      if (
        currentOrder.paymentId === String(payment.id) &&
        currentOrder.paymentStatus === newPaymentStatus &&
        currentOrder.status === newOrderStatus
      ) {
        return currentOrder;
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentId: String(payment.id),
          paymentStatus: newPaymentStatus,
          status: newOrderStatus,
          paymentMethod: payment.payment_method_id || null,
          statusHistory: {
            create: {
              fromStatus: currentOrder.status,
              toStatus: newOrderStatus,
              changedBy: "webhook_mercadopago",
              note: `Webhook Mercado Pago: status ${mpStatus} (ID ${payment.id})`,
            },
          },
        },
      });

      return updated;
    });

    // Envia notificações ao cliente caso o pagamento tenha sido confirmado
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
    console.error(`Erro ao processar webhook Mercado Pago para ID ${dataId}:`, error);
    return new Response("Erro interno do servidor", { status: 500 });
  }
}
