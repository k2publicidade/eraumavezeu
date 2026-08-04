import crypto from "crypto";

type VerifyMercadoPagoSignatureInput = {
  secret: string;
  dataId: string;
  xSignature: string | null;
  xRequestId: string | null;
};

export function buildMercadoPagoSignatureManifest(
  dataId: string,
  requestId: string,
  timestamp: string,
): string {
  return `id:${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
}

export function verifyMercadoPagoWebhookSignature({
  secret,
  dataId,
  xSignature,
  xRequestId,
}: VerifyMercadoPagoSignatureInput): boolean {
  if (!secret || !dataId || !xSignature) return false;

  const signatureParts = new Map(
    xSignature.split(",").flatMap((part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) return [];
      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      return key && value ? [[key, value] as const] : [];
    }),
  );

  const timestamp = signatureParts.get("ts");
  const receivedSignature = signatureParts.get("v1");
  if (!timestamp || !/^\d+$/.test(timestamp) || !receivedSignature) return false;
  if (!/^[a-f0-9]{64}$/i.test(receivedSignature)) return false;

  const manifest = buildMercadoPagoSignatureManifest(
    dataId,
    xRequestId || "",
    timestamp,
  );
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest();
  const receivedBuffer = Buffer.from(receivedSignature, "hex");

  return (
    expectedSignature.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedSignature, receivedBuffer)
  );
}
