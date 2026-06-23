import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import crypto from "crypto";
import type { PaymentGateway, OrderWithDetails, PaymentResponse, WebhookResult } from "./types";

const accessToken = process.env.MP_ACCESS_TOKEN || "";

export const mpConfig = new MercadoPagoConfig({
  accessToken: accessToken,
});

export const mpPreference = new Preference(mpConfig);
export const mpPayment = new Payment(mpConfig);

export class MercadoPagoGateway implements PaymentGateway {
  name = "MERCADOPAGO";

  async createPayment(order: OrderWithDetails): Promise<PaymentResponse> {
    if (!accessToken) {
      return { success: false, error: "Token de acesso do Mercado Pago não configurado." };
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    try {
      const preferenceItems = order.items.map((it) => {
        const unitPrice = Number(it.price) - (Number(it.discount) / it.quantity);
        return {
          id: it.productId,
          title: it.product.name,
          quantity: it.quantity,
          unit_price: Number(unitPrice.toFixed(2)),
        };
      });

      // Se houver frete, adiciona como item de preferência
      const shippingCost = Number(order.shippingCost);
      if (shippingCost > 0) {
        preferenceItems.push({
          id: "shipping",
          title: `Frete: ${order.shippingMethod || "Entrega"}`,
          quantity: 1,
          unit_price: Number(shippingCost.toFixed(2)),
        });
      }

      const preferenceResponse = await mpPreference.create({
        body: {
          items: preferenceItems,
          back_urls: {
            success: `${baseUrl}/pedido/${order.id}?payment=success`,
            failure: `${baseUrl}/pedido/${order.id}?payment=failure`,
            pending: `${baseUrl}/pedido/${order.id}?payment=pending`,
          },
          auto_return: "approved",
          external_reference: order.id,
          notification_url: `${baseUrl}/api/webhook/mercadopago`,
        },
      });

      const paymentUrl = process.env.NODE_ENV === "production"
        ? preferenceResponse.init_point
        : preferenceResponse.sandbox_init_point || preferenceResponse.init_point;

      return {
        success: true,
        paymentUrl: paymentUrl || undefined,
        paymentId: preferenceResponse.id || undefined,
      };
    } catch (err) {
      console.error("Erro ao criar preferência no Mercado Pago:", err);
      return { success: false, error: "Falha ao gerar link de pagamento no Mercado Pago." };
    }
  }

  async processWebhook(req: Request): Promise<WebhookResult> {
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
        // Ignorar se não for JSON
      }
    }

    const isPaymentEvent = topic === "payment" || (typeof topic === "string" && topic.startsWith("payment"));
    if (!isPaymentEvent || !dataId) {
      return { success: false, error: "Ignorado - não é evento de pagamento" };
    }

    // Verifica a assinatura
    const signatureVerified = this.verifySignature(req.headers, dataId);
    if (!signatureVerified) {
      console.error(`Assinatura inválida no webhook para o pagamento ${dataId}`);
      return { success: false, error: "Assinatura inválida" };
    }

    try {
      // Consulta os detalhes do pagamento no Mercado Pago
      const payment = await mpPayment.get({ id: dataId });
      const orderId = payment.external_reference;

      if (!orderId) {
        return { success: false, error: "Pagamento não possui external_reference" };
      }

      const mpStatus = payment.status;
      let paymentStatus: "PENDENTE" | "APROVADO" | "REJEITADO" | "REEMBOLSADO" = "PENDENTE";
      let orderStatus: "AGUARDANDO_PAGAMENTO" | "PAGAMENTO_CONFIRMADO" | "CANCELADO" = "AGUARDANDO_PAGAMENTO";

      if (mpStatus === "approved") {
        paymentStatus = "APROVADO";
        orderStatus = "PAGAMENTO_CONFIRMADO";
      } else if (mpStatus === "rejected") {
        paymentStatus = "REJEITADO";
        orderStatus = "AGUARDANDO_PAGAMENTO";
      } else if (mpStatus === "cancelled") {
        paymentStatus = "REJEITADO";
        orderStatus = "CANCELADO";
      } else if (mpStatus === "refunded") {
        paymentStatus = "REEMBOLSADO";
        orderStatus = "CANCELADO";
      }

      return {
        success: true,
        orderId,
        paymentId: String(payment.id),
        paymentStatus,
        orderStatus,
        paymentMethod: payment.payment_method_id || undefined,
      };
    } catch (err) {
      console.error("Erro ao buscar detalhes do pagamento no MP:", err);
      return { success: false, error: "Erro ao buscar detalhes do pagamento" };
    }
  }

  private verifySignature(headers: Headers, dataId: string): boolean {
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("MP_WEBHOOK_SECRET não está configurado. Pulando verificação em ambiente de desenvolvimento.");
      return process.env.NODE_ENV !== "production";
    }

    const xSignature = headers.get("x-signature");
    const xRequestId = headers.get("x-request-id");

    if (!xSignature) {
      return false;
    }

    const requestId = xRequestId || "";
    const parts = xSignature.split(",");
    let ts = "";
    let v1 = "";

    for (const part of parts) {
      const [key, value] = part.split("=");
      if (key === "ts") ts = value;
      if (key === "v1") v1 = value;
    }

    if (!ts || !v1) {
      return false;
    }

    const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;

    try {
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(manifest);
      const calculatedHash = hmac.digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(calculatedHash, "utf-8"),
        Buffer.from(v1, "utf-8")
      );
    } catch (err) {
      console.error("Erro ao computar assinatura HMAC-SHA256:", err);
      return false;
    }
  }
}
