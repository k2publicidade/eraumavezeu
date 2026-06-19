import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import crypto from "crypto";
import { db } from "./db";

const accessToken = process.env.MP_ACCESS_TOKEN || "";

export const mpConfig = new MercadoPagoConfig({
  accessToken: accessToken,
});

export const mpPreference = new Preference(mpConfig);
export const mpPayment = new Payment(mpConfig);

/**
 * Verifica a assinatura do webhook do Mercado Pago usando HMAC-SHA256.
 * Formato esperado do header x-signature: ts=timestamp,v1=assinatura
 */
export function verifyMPSignature(
  headers: { get: (name: string) => string | null },
  dataId: string
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("MP_WEBHOOK_SECRET não está configurado. Pulando verificação em ambiente de desenvolvimento.");
    return process.env.NODE_ENV !== "production";
  }

  const xSignature = headers.get("x-signature");
  const xRequestId = headers.get("x-request-id");

  if (!xSignature) {
    console.warn("Header x-signature ausente.");
    return false;
  }

  // Em ambiente de teste/sandbox local, o x-request-id pode estar ausente.
  // A especificação oficial diz para usar o x-request-id se existir.
  const requestId = xRequestId || "";

  // Parse do header x-signature
  const parts = xSignature.split(",");
  let ts = "";
  let v1 = "";

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "ts") ts = value;
    if (key === "v1") v1 = value;
  }

  if (!ts || !v1) {
    console.warn("Formato do x-signature inválido ou incompleto.");
    return false;
  }

  // Monta o manifesto: id:<dataId>;request-id:<requestId>;ts:<ts>;
  // O dataId deve estar em lowercase de acordo com a documentação oficial.
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

/**
 * Gera ou recupera um link de pagamento (preferência) para um pedido existente.
 */
export async function getOrCreatePaymentUrl(orderId: string): Promise<string | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.status !== "AGUARDANDO_PAGAMENTO") return null;

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

    return process.env.NODE_ENV === "production"
      ? preferenceResponse.init_point || null
      : preferenceResponse.sandbox_init_point || preferenceResponse.init_point || null;
  } catch (err) {
    console.error("Erro ao gerar link de pagamento na consulta:", err);
    return null;
  }
}

