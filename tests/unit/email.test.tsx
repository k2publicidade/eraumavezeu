import { afterEach, describe, expect, it, vi } from "vitest";
import {
  sendEmail,
  setEmailClient,
  type EmailClient,
  type EmailMessage,
} from "@/lib/email";
import { renderOrderConfirmationEmail } from "@/emails/order-confirmation";
import { renderOrderStatusEmail } from "@/emails/order-status";

afterEach(() => {
  // restaura o stub padrão (sem RESEND_API_KEY em test, defaultClient é stub)
  setEmailClient({
    sendEmail: async () => ({ ok: true, messageId: "stub-reset" }),
  });
});

describe("sendEmail", () => {
  it("usa o stub sem RESEND_API_KEY — finge sucesso sem efeito colateral", async () => {
    expect(process.env.RESEND_API_KEY).toBeFalsy();
    const res = await sendEmail({
      to: "teste@email.com",
      subject: "Teste",
      html: "<p>oi</p>",
    });
    expect(res.ok).toBe(true);
    expect(res.messageId).toMatch(/^stub-/);
  });

  it("permite injetar cliente fake (contrato EmailClient)", async () => {
    const sent: EmailMessage[] = [];
    const fake: EmailClient = {
      sendEmail: async (msg) => {
        sent.push(msg);
        return { ok: true, messageId: "fake-1" };
      },
    };
    setEmailClient(fake);

    const res = await sendEmail({
      to: "alvo@email.com",
      subject: "Assunto",
      html: "<p>corpo</p>",
    });

    expect(res.messageId).toBe("fake-1");
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("alvo@email.com");
  });
});

describe("renderOrderConfirmationEmail", () => {
  const props = {
    buyerName: "Mariana Souza",
    orderCode: "ABCD1234",
    items: [
      { name: "Livro Principal Capa Dura", quantity: 1, lineTotal: 249.9 },
      { name: "Quebra-Cabeça", quantity: 1, lineTotal: 59.9 },
    ],
    subtotal: 329.8,
    discount: 20,
    total: 309.8,
  };

  it("gera assunto com o código do pedido", async () => {
    const { subject } = await renderOrderConfirmationEmail(props);
    expect(subject).toContain("#ABCD1234");
    expect(subject).toContain("Era Uma Vez Eu");
  });

  it("HTML contém primeiro nome, código, itens e total em BRL", async () => {
    const { html } = await renderOrderConfirmationEmail(props);
    expect(html).toContain("Mariana");
    expect(html).toContain("#ABCD1234");
    expect(html).toContain("Livro Principal Capa Dura");
    // Intl usa espaço não-separável entre R$ e o valor
    expect(html).toContain("309,80");
    expect(html).toContain("Desconto combo");
  });

  it("omite linha de desconto quando não há combo", async () => {
    const { html } = await renderOrderConfirmationEmail({
      ...props,
      discount: 0,
      subtotal: 249.9,
      total: 249.9,
      items: [props.items[0]],
    });
    expect(html).not.toContain("Desconto combo");
  });

  it("deixa claro que nenhuma cobrança foi feita (checkout sem gateway)", async () => {
    const { html } = await renderOrderConfirmationEmail(props);
    expect(html).toContain("Nenhuma cobrança foi feita ainda");
    expect(html).not.toContain("Mercado Pago");
  });
});

describe("renderOrderStatusEmail", () => {
  const baseProps = {
    buyerName: "Mariana Souza",
    orderCode: "XYZ987",
    orderId: "ord_123",
  };

  it("gera assunto com o código do pedido e o status traduzido", async () => {
    const { subject } = await renderOrderStatusEmail({
      ...baseProps,
      toStatus: "EM_PRODUCAO",
    });
    expect(subject).toContain("#XYZ987");
    expect(subject).toContain("Em produção");
    expect(subject).toContain("Era Uma Vez Eu");
  });

  it("HTML contém primeiro nome, código do pedido e botão de CTA", async () => {
    const { html } = await renderOrderStatusEmail({
      ...baseProps,
      toStatus: "EM_PRODUCAO",
    });
    expect(html).toContain("Mariana");
    expect(html).toContain("#XYZ987");
    expect(html).toContain("Acompanhar Produção");
    expect(html).toContain("/pedido/ord_123");
  });

  it("renderiza detalhes específicos para PAGAMENTO_CONFIRMADO", async () => {
    const { html } = await renderOrderStatusEmail({
      ...baseProps,
      toStatus: "PAGAMENTO_CONFIRMADO",
    });
    expect(html).toContain("Pagamento Confirmado");
    expect(html).toContain("preparando tudo");
  });

  it("renderiza detalhes específicos para ENVIADO com código de rastreamento", async () => {
    const { html } = await renderOrderStatusEmail({
      ...baseProps,
      toStatus: "ENVIADO",
      trackingCode: "BR123456789BR",
    });
    expect(html).toContain("BR123456789BR");
    expect(html).toContain("Rastrear Entrega");
  });

  it("renderiza detalhes específicos para ENTREGUE", async () => {
    const { html } = await renderOrderStatusEmail({
      ...baseProps,
      toStatus: "ENTREGUE",
    });
    expect(html).toContain("Entrega concluída");
    expect(html).toContain("Deixar uma Avaliação");
  });

  it("renderiza detalhes específicos para CANCELADO", async () => {
    const { html } = await renderOrderStatusEmail({
      ...baseProps,
      toStatus: "CANCELADO",
    });
    expect(html).toContain("Pedido cancelado");
    expect(html).toContain("Falar com o Suporte");
  });
});
