import type { PaymentGateway, OrderWithDetails, PaymentResponse, WebhookResult } from "./types";

export class SimulatedGateway implements PaymentGateway {
  name = "SIMULADO";

  async createPayment(order: OrderWithDetails): Promise<PaymentResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const paymentUrl = `${baseUrl}/checkout/simulado?orderId=${order.id}`;

    return {
      success: true,
      paymentUrl,
      paymentId: `sim_pref_${Date.now()}`,
    };
  }

  async processWebhook(req: Request): Promise<WebhookResult> {
    try {
      const body = await req.json();
      const { orderId, status } = body;

      if (!orderId || !status) {
        return { success: false, error: "Parâmetros obrigatórios ausentes" };
      }

      if (status !== "APROVADO" && status !== "REJEITADO") {
        return { success: false, error: "Status inválido para simulação" };
      }

      let orderStatus: "AGUARDANDO_PAGAMENTO" | "PAGAMENTO_CONFIRMADO" | "CANCELADO" = "AGUARDANDO_PAGAMENTO";
      if (status === "APROVADO") {
        orderStatus = "PAGAMENTO_CONFIRMADO";
      } else if (status === "REJEITADO") {
        orderStatus = "CANCELADO";
      }

      return {
        success: true,
        orderId,
        paymentId: `sim_${Date.now()}`,
        paymentStatus: status,
        orderStatus,
        paymentMethod: "simulado",
      };
    } catch (err) {
      console.error("Erro ao processar webhook simulado:", err);
      return { success: false, error: "Erro interno" };
    }
  }
}
