import { renderOrderConfirmationEmail } from "@/emails/order-confirmation";
import { sendEmail } from "@/lib/email";
import { formatBRL } from "@/lib/format";
import { CONTACT_EMAIL } from "@/lib/site-config";
import { sendMessage } from "@/lib/whatsapp";
import { initWhatsAppFromEnv } from "@/lib/whatsapp-evolution";

// ativa Evolution se as envs existirem; sem elas o stub só loga
initWhatsAppFromEnv();

export type OrderNotificationData = {
  orderId: string;
  orderCode: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  whatsappOptIn: boolean;
  items: { name: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
};

function buyerWhatsAppText(data: OrderNotificationData): string {
  const firstName = data.buyerName.trim().split(/\s+/)[0] || "cliente";
  return [
    `Olá, ${firstName}! 📚 Aqui é o Era Uma Vez Eu.`,
    ``,
    `Recebemos seu pedido #${data.orderCode} (total ${formatBRL(data.total)}).`,
    `Em breve confirmamos as fotos por aqui e enviamos o link de pagamento.`,
  ].join("\n");
}

function teamEmailHtml(data: OrderNotificationData): string {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const itemRows = data.items
    .map((it) => `<li>${it.quantity}x ${it.name} — ${formatBRL(it.lineTotal)}</li>`)
    .join("");
  return [
    `<h2>Novo pedido #${data.orderCode}</h2>`,
    `<p><strong>Cliente:</strong> ${data.buyerName} &lt;${data.buyerEmail}&gt; — ${data.buyerPhone}</p>`,
    `<p><strong>WhatsApp opt-in:</strong> ${data.whatsappOptIn ? "sim" : "não"}</p>`,
    `<ul>${itemRows}</ul>`,
    `<p><strong>Total:</strong> ${formatBRL(data.total)}${
      data.discount > 0 ? ` (desconto combo ${formatBRL(data.discount)})` : ""
    }</p>`,
    `<p><a href="${baseUrl}/pedido/${data.orderId}">Ver pedido</a></p>`,
  ].join("\n");
}

/**
 * Comunicação pós-criação do pedido: confirmação ao comprador (e-mail e,
 * com opt-in, WhatsApp) + aviso interno à equipe.
 *
 * NUNCA lança — o pedido já está no banco; comunicação é melhor-esforço.
 * Falhas são logadas e visíveis no Sentry via console.error.
 */
export async function notifyOrderCreated(
  data: OrderNotificationData,
): Promise<void> {
  const teamEmail = process.env.ORDER_NOTIFICATIONS_EMAIL || CONTACT_EMAIL;

  const tasks: { label: string; run: () => Promise<{ ok: boolean; error?: string }> }[] = [
    {
      label: "email-comprador",
      run: async () => {
        const { subject, html } = await renderOrderConfirmationEmail({
          buyerName: data.buyerName,
          orderCode: data.orderCode,
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          total: data.total,
        });
        return sendEmail({ to: data.buyerEmail, subject, html });
      },
    },
    {
      label: "email-equipe",
      run: () =>
        sendEmail({
          to: teamEmail,
          subject: `Novo pedido #${data.orderCode} — ${formatBRL(data.total)}`,
          html: teamEmailHtml(data),
        }),
    },
  ];

  if (data.whatsappOptIn) {
    tasks.push({
      label: "whatsapp-comprador",
      run: () =>
        sendMessage({ phone: data.buyerPhone, text: buyerWhatsAppText(data) }),
    });
  }

  const results = await Promise.allSettled(tasks.map((t) => t.run()));
  results.forEach((res, i) => {
    const label = tasks[i].label;
    if (res.status === "rejected") {
      console.error(`[notify:${label}] rejeitado`, res.reason);
    } else if (!res.value.ok) {
      console.error(`[notify:${label}] falhou: ${res.value.error}`);
    }
  });
}
