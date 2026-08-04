import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { notifyOrderStatusChanged } from "@/lib/notifications/order-status";
import { orderCodeOf } from "@/lib/orders/build-order";
import { MercadoPagoProductionConfigurationError } from "@/lib/payments/mercadopago-environment";
import {
  createTransparentMercadoPagoPayment,
  mapMercadoPagoPaymentState,
  mercadoPagoErrorDiagnostic,
  transparentPaymentPersistenceState,
  transparentPaymentInputSchema,
} from "@/lib/payments/mercadopago-transparent";

export const dynamic = "force-dynamic";

function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origem da requisição inválida." }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const envelope = transparentPaymentInputSchema.extend({
    orderId: z.string().cuid(),
  }).safeParse(payload);

  if (!envelope.success) {
    return NextResponse.json({ error: "Dados de pagamento inválidos." }, { status: 400 });
  }

  const { orderId, ...paymentInput } = envelope.data;
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, shippingAddress: true },
  });

  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  if (order.paymentGateway !== "MERCADOPAGO" || order.status !== "AGUARDANDO_PAGAMENTO") {
    return NextResponse.json({ error: "Este pedido não aceita pagamentos." }, { status: 409 });
  }
  if (order.paymentStatus === "APROVADO") {
    return NextResponse.json({ error: "Este pedido já está pago.", status: "approved" }, { status: 409 });
  }

  try {
    const payment = await createTransparentMercadoPagoPayment(order, paymentInput);
    if (!payment.id) throw new Error("PAYMENT_WITHOUT_ID");
    const mapped = mapMercadoPagoPaymentState(payment.status);

    const transactionResult = await db.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: order.id } });
      if (!current) throw new Error("ORDER_DISAPPEARED");
      if (current.paymentStatus === "APROVADO") {
        return { order: current, becameConfirmed: false };
      }
      const persistence = transparentPaymentPersistenceState(current, payment, mapped);
      if (!persistence.needsUpdate) {
        return { order: current, becameConfirmed: false };
      }

      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentId: payment.id,
          paymentMethod: payment.paymentMethod,
          paymentStatus: mapped.paymentStatus,
          status: mapped.orderStatus,
          pixQrCode: payment.pixQrCode || current.pixQrCode,
          pixQrCodeBase64: payment.pixQrCodeBase64 || current.pixQrCodeBase64,
          statusHistory: persistence.statusChanged ? {
            create: {
              fromStatus: current.status,
              toStatus: mapped.orderStatus,
              changedBy: "checkout_mercadopago",
              note: `Pagamento transparente Mercado Pago: ${payment.status} (ID ${payment.id})`,
            },
          } : undefined,
        },
      });
      return {
        order: updated,
        becameConfirmed:
          updated.status === "PAGAMENTO_CONFIRMADO" && current.status !== "PAGAMENTO_CONFIRMADO",
      };
    });

    const updatedOrder = transactionResult.order;
    if (transactionResult.becameConfirmed) {
      await notifyOrderStatusChanged({
        orderId: updatedOrder.id,
        orderCode: orderCodeOf(updatedOrder.id),
        buyerName: updatedOrder.guestName || "Cliente",
        buyerEmail: updatedOrder.guestEmail || "",
        buyerPhone: updatedOrder.guestPhone || "",
        whatsappOptIn: updatedOrder.whatsappOptIn,
        toStatus: "PAGAMENTO_CONFIRMADO",
      }).catch(() => undefined);
    }

    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      statusDetail: payment.statusDetail,
      paymentMethod: payment.paymentMethod,
      pixQrCode: payment.pixQrCode,
      pixQrCodeBase64: payment.pixQrCodeBase64,
    });
  } catch (error) {
    if (error instanceof MercadoPagoProductionConfigurationError) {
      return NextResponse.json({
        error: "O pagamento está temporariamente indisponível porque a conta Mercado Pago ainda não possui credenciais reais de produção.",
        code: "MERCADOPAGO_NOT_PRODUCTION",
      }, { status: 503 });
    }

    console.error(
      "[Mercado Pago] Transparent payment failed.",
      mercadoPagoErrorDiagnostic(error),
    );
    return NextResponse.json({
      error: "Não foi possível processar o pagamento. Confira os dados e tente novamente.",
    }, { status: 502 });
  }
}
