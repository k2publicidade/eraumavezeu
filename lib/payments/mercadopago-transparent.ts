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
  deviceId: z.string().trim().min(8).max(256).regex(/^[A-Za-z0-9._:-]+$/).optional(),
  formData: z.object({
    payment_method_id: z.string().trim().min(1).max(50),
    token: z.string().trim().min(10).max(512).optional(),
    issuer_id: z.union([z.string(), z.number()]).optional(),
    installments: z.coerce.number().int().min(1).max(12).optional(),
    transaction_amount: z.number().positive().optional(),
    payer: z.object({
      email: z.string().trim().email().max(254).optional(),
      identification: z.object({
        type: z.enum(["CPF", "CNPJ"]),
        number: z.string().trim().max(24),
      }).optional(),
    }).passthrough().optional(),
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

export function transparentPaymentPersistenceState(
  current: {
    paymentId?: string | null;
    paymentMethod?: string | null;
    paymentStatus: string;
    status: string;
    pixQrCode?: string | null;
    pixQrCodeBase64?: string | null;
  },
  payment: {
    id: string;
    paymentMethod: string;
    pixQrCode?: string;
    pixQrCodeBase64?: string;
  },
  mapped: TransparentPaymentState,
) {
  const statusChanged =
    current.paymentStatus !== mapped.paymentStatus ||
    current.status !== mapped.orderStatus;
  const paymentChanged =
    current.paymentId !== payment.id ||
    current.paymentMethod !== payment.paymentMethod;
  const pixChanged =
    Boolean(payment.pixQrCode && current.pixQrCode !== payment.pixQrCode) ||
    Boolean(payment.pixQrCodeBase64 && current.pixQrCodeBase64 !== payment.pixQrCodeBase64);

  return {
    statusChanged,
    paymentChanged,
    pixChanged,
    needsUpdate: statusChanged || paymentChanged || pixChanged,
  };
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
  const orderDocument = (order.guestCpf || "").replace(/\D/g, "");
  const submittedIdentification = input.formData.payer?.identification;
  const submittedDocument = (submittedIdentification?.number || "").replace(/\D/g, "");
  const identification = !isPix && submittedIdentification &&
    ((submittedIdentification.type === "CPF" && submittedDocument.length === 11) ||
      (submittedIdentification.type === "CNPJ" && submittedDocument.length === 14))
    ? { type: submittedIdentification.type, number: submittedDocument }
    : orderDocument.length === 11
      ? { type: "CPF", number: orderDocument }
      : undefined;
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
    three_d_secure_mode: isPix ? undefined : "optional",
    payer: {
      entity_type: identification?.type === "CNPJ" ? "association" : "individual",
      email: order.guestEmail || "atendimento@eraumavezeu.com.br",
      first_name: firstName,
      last_name: lastName,
      identification,
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
        unit_price: Number(item.price),
      })),
      payer: {
        first_name: firstName,
        last_name: lastName,
      },
      shipments: order.shippingAddress ? {
        receiver_address: {
          zip_code: order.shippingAddress.zipCode,
          street_name: order.shippingAddress.street,
          street_number: order.shippingAddress.number,
          city_name: order.shippingAddress.city,
          state_name: order.shippingAddress.state,
        },
      } : undefined,
    },
  };
}

export function mercadoPagoErrorDiagnostic(error: unknown) {
  if (!(error instanceof Error)) return { name: "UnknownPaymentError" };

  const sdkError = error as Error & {
    status?: unknown;
    cause?: unknown;
  };
  const causes = Array.isArray(sdkError.cause)
    ? sdkError.cause.slice(0, 5).map((cause) => {
        if (!cause || typeof cause !== "object") return { code: "unknown" };
        const entry = cause as { code?: unknown; description?: unknown };
        return {
          code: typeof entry.code === "string" || typeof entry.code === "number"
            ? String(entry.code).slice(0, 80)
            : "unknown",
          description: typeof entry.description === "string"
            ? entry.description.slice(0, 240)
            : undefined,
        };
      })
    : undefined;

  return {
    name: error.name.slice(0, 80),
    message: error.message.slice(0, 300),
    status: typeof sdkError.status === "number" ? sdkError.status : undefined,
    causes,
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
    requestOptions: {
      idempotencyKey: paymentIdempotencyKey(order.id, input),
      meliSessionId: input.formData.payment_method_id === "pix" ? undefined : input.deviceId,
    },
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
    threeDsInfo: payment.three_ds_info?.external_resource_url && payment.three_ds_info?.creq
      ? {
          externalResourceUrl: payment.three_ds_info.external_resource_url,
          creq: payment.three_ds_info.creq,
        }
      : undefined,
  };
}
