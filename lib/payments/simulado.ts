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
      pixQrCode: `00020101021226870014br.gov.bcb.pix2565pix-h.mercadopago.com/qr/v2/simulado-order-${order.id}-5204000053039865802BR5925Era Uma Vez Eu6009SAO PAULO62070503***6304ABCD`,
      pixQrCodeBase64: "iVBORw0KGgoAAAANSUhEUgAAAJQAAACUAQMAAAB7HnJ2AAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAnklEQVQoz2P4DwUMDKwGBg5WIPmfgQFIM/z/DxMCDkP+P8OAsAGxP8PAsIGwP6PDsAGlP6MDsUGF/2NDsEG1/0NDsEG9P0NAsEG9P5PDsEG9P7NDsEG9P0NAsEG9P8NDsEGdPyPDsEGdfyNDsEHdPyPDsEHdf2NDsEHdP6PDsEGdP0NDsEG9/0NDsEG9PyNDsEG9PyNDsEG9PyPDsEG9PyPDsEG9P0NAsEG9PyND2GAAAABJRU5ErkJggg==",
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
