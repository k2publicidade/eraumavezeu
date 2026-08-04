import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import type { PaymentGateway, OrderWithDetails, PaymentResponse, WebhookResult } from "./types";
import { orderCodeOf } from "@/lib/orders/build-order";
import { getSiteUrl } from "@/lib/site-url";
import {
  assertMercadoPagoEnvironment,
  assertMercadoPagoLiveMode,
  MercadoPagoProductionConfigurationError,
  selectMercadoPagoCheckoutUrl,
} from "./mercadopago-environment";
import { verifyMercadoPagoWebhookSignature } from "./mercadopago-webhook-signature";

const accessToken = process.env.MP_ACCESS_TOKEN || "";

export const mpConfig = new MercadoPagoConfig({
  accessToken,
  options: { timeout: 10_000 },
});

export const mpPreference = new Preference(mpConfig);
export const mpPayment = new Payment(mpConfig);

export class MercadoPagoGateway implements PaymentGateway {
  name = "MERCADOPAGO";

  async createPayment(order: OrderWithDetails): Promise<PaymentResponse> {
    if (!accessToken) {
      return { success: false, error: "Token de acesso do Mercado Pago não configurado." };
    }

    try {
      assertMercadoPagoEnvironment();
    } catch {
      console.error("[Mercado Pago] Production blocked: invalid environment.");
      return {
        success: false,
        error: "Pagamento temporariamente indisponível por configuração.",
      };
    }

    const baseUrl = getSiteUrl();

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

      const isHttpLocalhost = baseUrl.startsWith("http://localhost") || baseUrl.startsWith("http://127.0.0.1");
      const notificationUrl = isHttpLocalhost ? undefined : `${baseUrl}/api/webhook/mercadopago`;

      // 1. Criar o pagamento PIX no Mercado Pago
      let pixQrCode: string | undefined = undefined;
      let pixQrCodeBase64: string | undefined = undefined;

      try {
        const orderCode = orderCodeOf(order.id);
        const buyerName = order.guestName || "Cliente";
        const firstName = buyerName.split(" ")[0] || "Cliente";
        const lastName = buyerName.split(" ").slice(1).join(" ") || "Era Uma Vez Eu";

        const pixResponse = await mpPayment.create({
          body: {
            transaction_amount: Number(order.total.toFixed(2)),
            description: `Pedido #${orderCode} - Era Uma Vez Eu`,
            payment_method_id: "pix",
            payer: {
              email: order.guestEmail || "atendimento@eraumavezeu.com.br",
              first_name: firstName,
              last_name: lastName,
            },
            notification_url: notificationUrl,
            external_reference: order.id,
          },
          requestOptions: {
            idempotencyKey: `pix-${order.id}`,
          },
        });

        assertMercadoPagoLiveMode(pixResponse.live_mode);

        if (pixResponse && pixResponse.id) {
          const transData = (pixResponse as any).point_of_interaction?.transaction_data || (pixResponse as any).point_of_integration?.transaction_data;
          if (transData) {
            pixQrCode = transData.qr_code;
            pixQrCodeBase64 = transData.qr_code_base64;
          }
        }
      } catch (pixErr) {
        if (pixErr instanceof MercadoPagoProductionConfigurationError) {
          throw pixErr;
        }
        console.error("[Mercado Pago] Failed to create PIX payment.");
      }

      // 2. Criar a Preferência (Checkout Pro) para Cartão/Boleto
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
          notification_url: notificationUrl,
        },
        requestOptions: {
          idempotencyKey: `checkout-${order.id}`,
        },
      });

      if (process.env.NODE_ENV === "production") {
        const preferenceVerification = await mpPreference.search({
          options: { external_reference: order.id, limit: 20 },
        });
        const createdPreference = preferenceVerification.elements?.find(
          (preference) => preference.id === preferenceResponse.id,
        );
        assertMercadoPagoLiveMode(createdPreference?.live_mode);
      }

      const paymentUrl = selectMercadoPagoCheckoutUrl({
        initPoint: preferenceResponse.init_point,
        sandboxInitPoint: preferenceResponse.sandbox_init_point,
      });

      return {
        success: true,
        paymentUrl: paymentUrl || undefined,
        paymentId: preferenceResponse.id || undefined,
        pixQrCode,
        pixQrCodeBase64,
      };
    } catch (err: unknown) {
      const configurationError = err instanceof MercadoPagoProductionConfigurationError;
      console.error(
        configurationError
          ? "[Mercado Pago] Production blocked: API returned test mode."
          : "[Mercado Pago] Failed to create payment.",
      );
      
      const isHttpLocalhost = baseUrl.startsWith("http://localhost") || baseUrl.startsWith("http://127.0.0.1");
      if (isHttpLocalhost) {
        console.warn(
          "\n[MERCADO PAGO - ALERTA DE CONFIGURAÇÃO]\n" +
          "Identificamos que a URL pública está configurada como HTTP local (localhost).\n" +
          "O Mercado Pago exige obrigatoriamente protocolo HTTPS para as URLs de retorno (back_urls e webhook).\n" +
          "Para testar localmente, utilize uma ferramenta de túnel (ex: ngrok, localtunnel) e defina a variável:\n" +
          "NEXT_PUBLIC_SITE_URL=\"https://seu-subdominio.ngrok-free.app\"\n"
        );
      }
      
      return { 
        success: false, 
        error: configurationError
          ? "Pagamento temporariamente indisponível por configuração."
          : isHttpLocalhost
          ? "Configuração local inválida (Mercado Pago exige HTTPS nas URLs de retorno). Configure um túnel HTTPS." 
          : "Falha ao gerar link de pagamento no Mercado Pago." 
      };
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
    const signatureVerified = verifyMercadoPagoWebhookSignature({
      secret: process.env.MP_WEBHOOK_SECRET || "",
      dataId,
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
    });
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

}
