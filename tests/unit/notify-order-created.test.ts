import { beforeEach, describe, expect, it, vi } from "vitest";
import { setEmailClient, type EmailMessage } from "@/lib/email";
import { setWhatsAppClient, type WhatsAppMessage } from "@/lib/whatsapp";
import {
  notifyOrderCreated,
  type OrderNotificationData,
} from "@/lib/notifications/order-created";

const ORDER: OrderNotificationData = {
  orderId: "clx-order-id-5678efgh",
  orderCode: "5678EFGH",
  buyerName: "Mariana Souza",
  buyerEmail: "mariana@email.com",
  buyerPhone: "11999999999",
  whatsappOptIn: true,
  items: [{ name: "Livro Principal Capa Dura", quantity: 1, lineTotal: 249.9 }],
  subtotal: 249.9,
  discount: 0,
  total: 249.9,
};

let emails: EmailMessage[];
let whatsapps: WhatsAppMessage[];

beforeEach(() => {
  emails = [];
  whatsapps = [];
  setEmailClient({
    sendEmail: async (msg) => {
      emails.push(msg);
      return { ok: true, messageId: `m-${emails.length}` };
    },
  });
  setWhatsAppClient({
    sendMessage: async (msg) => {
      whatsapps.push(msg);
      return { ok: true, messageId: `w-${whatsapps.length}` };
    },
  });
});

describe("notifyOrderCreated", () => {
  it("envia e-mail de confirmação ao comprador e aviso à equipe", async () => {
    await notifyOrderCreated(ORDER);

    const buyerMail = emails.find((m) => m.to === ORDER.buyerEmail);
    expect(buyerMail).toBeDefined();
    expect(buyerMail?.subject).toContain("#5678EFGH");

    const teamMail = emails.find((m) => m.to !== ORDER.buyerEmail);
    expect(teamMail).toBeDefined();
    expect(teamMail?.subject).toContain("Novo pedido #5678EFGH");
    expect(teamMail?.html).toContain("Mariana Souza");
    expect(teamMail?.html).toContain("/pedido/clx-order-id-5678efgh");
  });

  it("envia WhatsApp ao comprador apenas com opt-in", async () => {
    await notifyOrderCreated(ORDER);
    expect(whatsapps).toHaveLength(1);
    expect(whatsapps[0].phone).toBe(ORDER.buyerPhone);
    expect(whatsapps[0].text).toContain("#5678EFGH");

    whatsapps = [];
    await notifyOrderCreated({ ...ORDER, whatsappOptIn: false });
    expect(whatsapps).toHaveLength(0);
  });

  it("NUNCA lança — falha de e-mail vira console.error, não exceção", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    setEmailClient({
      sendEmail: async () => {
        throw new Error("Resend fora do ar");
      },
    });

    await expect(notifyOrderCreated(ORDER)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("falha parcial não impede os outros canais (allSettled)", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    setEmailClient({
      sendEmail: async () => ({ ok: false, error: "bounce" }),
    });

    await notifyOrderCreated(ORDER);
    // WhatsApp ainda foi enviado mesmo com os 2 e-mails falhando
    expect(whatsapps).toHaveLength(1);
    expect(errorSpy).toHaveBeenCalledTimes(2);
    errorSpy.mockRestore();
  });
});
