import crypto from "crypto";
import { z } from "zod";
import type { PaymentCreateRequest } from "mercadopago/dist/clients/payment/create/types";
import type { OrderWithDetails } from "./types";
import { getSiteUrl } from "@/lib/site-url";
import { orderCodeOf } from "@/lib/orders/build-order";
import { assertMercadoPagoEnvironment, assertMercadoPagoLiveMode, MercadoPagoProductionConfigurationError } from "./mercadopago-environment";
import { mpPayment } from "./mercadopago";

const cardPaymentTypes = ["creditCard", "debitCard", "prepaidCard"] as const;

export const transparentPaymentInputSchema = z.object({
  selectedPaymentMethod: z.enum(["bank_transfer", ...cardPaymentTypes]),
  formData: z.object({
    payment_method_id: z.string().trim().min(1).max(50),
    token: z.string().trim().min(10).max(512).optional(),
    issuer_id: z.union([z.string(), z.number()]).optional(),
    installments: z.coerce.number().int().min(1).max(12).optional(),
    transaction_amount: z.number().positive().optional(),
  }).passthrough(),
});

export type TransparentPaymentInput = z.infer<typeof transparentPaymentInputSchema>;

export type TransparentPaymentState = {
  paymentStatus: "PENDENTE" | "APROVADO" | "REJEITADO" | "REEMBOLSADO";
  orderStatus: "AGUARDANDO_PAGAMENTO" | "PAGAMENTO_CONFIRMADO" | "CANCELADO";
};

export function mapMercadoPagoPaymentState(status?: string): TransparentPaymentState {
  if (status === "approved") {
    return { paymentStatus: "APROVADO", orderStatus: "PAGAMENTO_CONFIRMADO" };
  }
  if (status === "rejected") {
    return { paymentStatus: "REJEITADO", orderStatus: "AGUARDANDO_PAGAMENTO" };
  }
  if (status === "cancelled" || status === "refunded") {
    return {
      paymentStatus: status === "refunded" ? "REEMBOLSADO" : "REJEITADO",
      orderStatus: "CANCELADO",
    };
  }
  return { paymentStatus: "PENDENTE", orderStatus: "AGUARDANDO_PAGAMENTO" };
}

export function paymentIdempotencyKey(orderId: string, input: TransparentPaymentInput): string {
  if (input.formData.payment_method_id === "pix") return `transparent-pix-${orderId}`;

  const tokenFingerprint = crypto
    .createHash("sha256")
    .update(input.formData.token || "missing-token")
    .digest("hex")
    .slice(0, 24);
  return `transparent-card-${orderId}-${tokenFingerprint}`;
}

function splitName(fullName?: string | null) {
  const parts = (fullName || "Cliente Era Uma Vez Eu").trim().split(/\s+/);
  return {
    firstName: parts[0] || "Cliente",
    lastName: parts.slice(1).join(" ") || "Era Uma Vez Eu",
  };
}

export function buildMercadoPagoPaymentBody(
  order: OrderWithDetails,
  input: TransparentPaymentInput,
): PaymentCreateRequest {
  const isPix = input.formData.payment_method_id === "pix";
  const isCard = cardPaymentTypes.includes(input.selectedPaymentMethod as (typeof cardPaymentTypes)[number]);

  if (isPix && input.selectedPaymentMethod !== "bank_transfer") {
    throw new Error("INVALID_PAYMENT_METHOD");
  }
  if (!isPix && (!isCard || !input.formData.token)) {
    throw new Error("INVALID_CARD_TOKEN");
  }

  const amount = Number(Number(order.total).toFixed(2));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("INVALID_ORDER_AMOUNT");

  const { firstName, lastName } = splitName(order.guestName);
  const cpf = (order.guestCpf || "").replace(/\D/g, "");
  const issuer = Number(input.formData.issuer_id);
  const webhookBase = process.env.VERCEL_PROJECT_PRODUCTION_URL || getSiteUrl();
  const normalizedWebhookBase = webhookBase.startsWith("http")
    ? webhookBase.replace(/\/+$/, "")
    : `https://${webhookBase.replace(/\/+$/, "")}`;
  const notificationUrl = /^https:\/\//i.test(normalizedWebhookBase)
    ? `${normalizedWebhookBase}/api/webhook/mercadopago`
    : undefined;

  return {
    transaction_amount: amount,
    description: `Pedido #${orderCodeOf(order.id)} - Era Uma Vez Eu`,
    external_reference: order.id,
    notification_url: notificationUrl,
    statement_descriptor: "ERAUMAVEZEU",
    payment_method_id: input.formData.payment_method_id,
    token: isPix ? undefined : input.formData.token,
    installments: isPix ? 1 : input.formData.installments || 1,
    issuer_id: !isPix && Number.isFinite(issuer) ? issuer : undefined,
    payer: {
      email: order.guestEmail || "atendimento@eraumavezeu.com.br",
      first_name: firstName,
      last_name: lastName,
      identification: cpf.length === 11 ? { type: "CPF", number: cpf } : undefined,
      address: order.shippingAddress ? {
        zip_code: order.shippingAddress.zipCode,
        street_name: order.shippingAddress.street,
        street_number: order.shippingAddress.number,
        neighborhood: order.shippingAddress.district,
        city: order.shippingAddress.city,
        federal_unit: order.shippingAddress.state,
      } : undefined,
    },
    additional_info: {
      items: order.items.map((item) => ({
        id: item.productId,
        title: item.product.name,
        quantity: item.quantity,
        currency_id: "BRL",
        unit_price: Number(item.price),
      })),
      payer: {
        first_name: firstName,
        last_name: lastName,
      },
      shipments: order.shippingAddress ? {
        cost: Number(order.shippingCost),
        receiver_address: {
          zip_code: order.shippingAddress.zipCode,
          street_name: order.shippingAddress.street,
          street_number: order.shippingAddress.number,
          city_name: order.shippingAddress.city,
          state_name: order.shippingAddress.state,
          country_name: "Brasil",
        },
      } : undefined,
    },
  };
}

async function assertRealSellerAccount(): Promise<void> {
  assertMercadoPagoEnvironment();
  if (process.env.NODE_ENV !== "production") return;

  const accessToken = process.env.MP_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new MercadoPagoProductionConfigurationError("Mercado Pago access token is missing");
  }

  const response = await fetch("https://api.mercadopago.com/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new MercadoPagoProductionConfigurationError("Mercado Pago account validation failed");
  }

  const account = await response.json() as { tags?: unknown };
  if (Array.isArray(account.tags) && account.tags.includes("test_user")) {
    throw new MercadoPagoProductionConfigurationError("Mercado Pago seller is a test user");
  }
}

export async function createTransparentMercadoPagoPayment(
  order: OrderWithDetails,
  input: TransparentPaymentInput,
) {
  await assertRealSellerAccount();
  const body = buildMercadoPagoPaymentBody(order, input);
  const payment = await mpPayment.create({
    body,
    requestOptions: { idempotencyKey: paymentIdempotencyKey(order.id, input) },
  });
  assertMercadoPagoLiveMode(payment.live_mode);

  const transactionData = payment.point_of_interaction?.transaction_data;
  return {
    id: payment.id ? String(payment.id) : "",
    status: payment.status || "pending",
    statusDetail: payment.status_detail || "",
    paymentMethod: payment.payment_method_id || input.formData.payment_method_id,
    pixQrCode: transactionData?.qr_code,
    pixQrCodeBase64: transactionData?.qr_code_base64,
  };
}
