import { renderOrderStatusEmail } from "@/emails/order-status";
import { sendEmail } from "@/lib/email";
import { statusLabelOf, type OrderStatusValue } from "@/lib/orders/status";
import { sendMessage } from "@/lib/whatsapp";
import { initWhatsAppFromEnv } from "@/lib/whatsapp-evolution";

initWhatsAppFromEnv();

export type OrderStatusNotificationData = {
  orderId: string;
  orderCode: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  whatsappOptIn: boolean;
  toStatus: OrderStatusValue;
  trackingCode?: string | null;
};

/** Mensagem amigável por status — usada no e-mail e no WhatsApp. */
export function statusMessage(data: OrderStatusNotificationData): string {
  switch (data.toStatus) {
    case "PAGAMENTO_CONFIRMADO":
      return "Pagamento confirmado! Já estamos preparando tudo para começar a produção do livro.";
    case "EM_PRODUCAO":
      return "Seu livro entrou em produção — nossa equipe está criando as ilustrações e revisando cada página.";
    case "AGUARDANDO_ENVIO":
      return "Seu livro ficou pronto e já está na fila de envio!";
    case "ENVIADO":
      return data.trackingCode
        ? `Seu pedido foi enviado! Código de rastreio: ${data.trackingCode}.`
        : "Seu pedido foi enviado! Em breve enviamos o código de rastreio.";
    case "ENTREGUE":
      return "Pedido entregue! Esperamos que a criança ame a história. Obrigado por criar com a gente. 💛";
    case "CANCELADO":
      return "Seu pedido foi cancelado. Se isso for um engano ou se quiser ajuda, é só responder esta mensagem.";
    default:
      return `Seu pedido está agora em: ${statusLabelOf(data.toStatus)}.`;
  }
}

/**
 * Comunica mudança de status ao comprador (e-mail e, com opt-in, WhatsApp).
 * NUNCA lança — mudança de status já está persistida; comunicação é melhor-esforço.
 */
export async function notifyOrderStatusChanged(
  data: OrderStatusNotificationData,
): Promise<void> {
  const firstName = data.buyerName.trim().split(/\s+/)[0] || "cliente";
  const label = statusLabelOf(data.toStatus);
  const message = statusMessage(data);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  const tasks: { label: string; run: () => Promise<{ ok: boolean; error?: string }> }[] = [
    {
      label: "email-status",
      run: async () => {
        const { subject, html } = await renderOrderStatusEmail({
          buyerName: data.buyerName,
          orderCode: data.orderCode,
          orderId: data.orderId,
          toStatus: data.toStatus,
          trackingCode: data.trackingCode,
        });
        return sendEmail({
          to: data.buyerEmail,
          subject,
          html,
        });
      },
    },
  ];

  if (data.whatsappOptIn) {
    tasks.push({
      label: "whatsapp-status",
      run: () =>
        sendMessage({
          phone: data.buyerPhone,
          text: `Olá, ${firstName}! 📚 Atualização do pedido #${data.orderCode}:\n\n${message}`,
        }),
    });
  }

  const results = await Promise.allSettled(tasks.map((t) => t.run()));
  results.forEach((res, i) => {
    const taskLabel = tasks[i].label;
    if (res.status === "rejected") {
      console.error(`[notify:${taskLabel}] rejeitado`, res.reason);
    } else if (!res.value.ok) {
      console.error(`[notify:${taskLabel}] falhou: ${res.value.error}`);
    }
  });
}
