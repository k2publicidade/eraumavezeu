import { beforeEach, describe, expect, it, vi } from "vitest";
import { setEmailClient, type EmailMessage } from "@/lib/email";
import { setWhatsAppClient, type WhatsAppMessage } from "@/lib/whatsapp";
import {
  notifyOrderStatusChanged,
  type OrderStatusNotificationData,
} from "@/lib/notifications/order-status";

const BASE: OrderStatusNotificationData = {
  orderId: "clx-order-id-5678efgh",
  orderCode: "5678EFGH",
  buyerName: "Mariana Souza",
  buyerEmail: "mariana@email.com",
  buyerPhone: "11999999999",
  whatsappOptIn: true,
  toStatus: "EM_PRODUCAO",
};

let emails: EmailMessage[];
let whatsapps: WhatsAppMessage[];

beforeEach(() => {
  emails = [];
  whatsapps = [];
  setEmailClient({
    sendEmail: async (msg) => {
      emails.push(msg);
      return { ok: true };
    },
  });
  setWhatsAppClient({
    sendMessage: async (msg) => {
      whatsapps.push(msg);
      return { ok: true };
    },
  });
});

describe("notifyOrderStatusChanged", () => {
  it("envia e-mail com o label do status no assunto e link do pedido", async () => {
    await notifyOrderStatusChanged(BASE);
    expect(emails).toHaveLength(1);
    expect(emails[0].to).toBe(BASE.buyerEmail);
    expect(emails[0].subject).toContain("Em produção");
    expect(emails[0].html).toContain(`/pedido/${BASE.orderId}`);
  });

  it("ENVIADO inclui o código de rastreio na mensagem", async () => {
    await notifyOrderStatusChanged({
      ...BASE,
      toStatus: "ENVIADO",
      trackingCode: "AA123456789BR",
    });
    expect(emails[0].html).toContain("AA123456789BR");
    expect(whatsapps[0].text).toContain("AA123456789BR");
  });

  it("ENVIADO sem rastreio promete o código em breve", async () => {
    await notifyOrderStatusChanged({ ...BASE, toStatus: "ENVIADO" });
    expect(emails[0].html).toContain("Em breve enviamos o código de rastreio");
  });

  it("respeita o opt-out de WhatsApp", async () => {
    await notifyOrderStatusChanged({ ...BASE, whatsappOptIn: false });
    expect(emails).toHaveLength(1);
    expect(whatsapps).toHaveLength(0);
  });

  it("NUNCA lança — falha vira console.error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    setEmailClient({
      sendEmail: async () => {
        throw new Error("Resend fora do ar");
      },
    });
    await expect(notifyOrderStatusChanged(BASE)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
