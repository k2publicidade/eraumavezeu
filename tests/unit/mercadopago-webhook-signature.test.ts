import crypto from "crypto";
import { describe, expect, it } from "vitest";
import {
  buildMercadoPagoSignatureManifest,
  verifyMercadoPagoWebhookSignature,
} from "@/lib/payments/mercadopago-webhook-signature";

const secret = "webhook-secret-used-only-in-unit-tests";
const dataId = "ABC123";
const requestId = "request-456";
const timestamp = "1785812400";

function validSignature(): string {
  const manifest = buildMercadoPagoSignatureManifest(dataId, requestId, timestamp);
  const hash = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  return `ts=${timestamp}, v1=${hash}`;
}

describe("Mercado Pago webhook signature", () => {
  it("accepts a valid signature and normalizes the data ID", () => {
    expect(
      verifyMercadoPagoWebhookSignature({
        secret,
        dataId,
        xSignature: validSignature(),
        xRequestId: requestId,
      }),
    ).toBe(true);
  });

  it("rejects a signature when the payment ID was tampered with", () => {
    expect(
      verifyMercadoPagoWebhookSignature({
        secret,
        dataId: "ABC124",
        xSignature: validSignature(),
        xRequestId: requestId,
      }),
    ).toBe(false);
  });

  it("rejects a signature when the request ID was tampered with", () => {
    expect(
      verifyMercadoPagoWebhookSignature({
        secret,
        dataId,
        xSignature: validSignature(),
        xRequestId: "different-request",
      }),
    ).toBe(false);
  });

  it.each([
    null,
    "",
    `ts=${timestamp}`,
    "ts=invalid,v1=not-a-hash",
    `ts=${timestamp},v1=${"a".repeat(63)}`,
  ])("rejects a missing or malformed x-signature: %s", (xSignature) => {
    expect(
      verifyMercadoPagoWebhookSignature({
        secret,
        dataId,
        xSignature,
        xRequestId: requestId,
      }),
    ).toBe(false);
  });
});
