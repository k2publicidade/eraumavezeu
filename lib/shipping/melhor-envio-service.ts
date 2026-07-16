import { db } from "@/lib/db";
import { orderCodeOf } from "@/lib/orders/build-order";
import { getSiteSettings } from "@/lib/site-content";

export type LabelResult =
  | { ok: true; labelId: string; labelUrl: string; price: number; trackingCode: string }
  | { ok: false; error: string };

/**
 * Service to interface with Melhor Envio API (v2)
 */
export class MelhorEnvioService {
  private static getApiUrl(): string {
    // If in production, use the production API. Otherwise, sandbox.
    return process.env.NODE_ENV === "production"
      ? "https://melhorenvio.com.br"
      : "https://sandbox.melhorenvio.com.br";
  }

  /**
   * Generates a shipping label for an order.
   * If isSimulation is true, or if MELHOR_ENVIO_TOKEN is not provided, it falls back to a simulated label.
   */
  static async generateLabel(orderId: string, isSimulation: boolean = true): Promise<LabelResult> {
    try {
      // 1. Fetch Order with address and items
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: {
          shippingAddress: true,
          items: { include: { product: true } },
        },
      });

      if (!order) {
        return { ok: false, error: "Pedido não encontrado." };
      }

      if (!order.shippingAddress) {
        return { ok: false, error: "Endereço de entrega não cadastrado." };
      }

      if (order.shippingLabelStatus === "GERADA") {
        return {
          ok: true,
          labelId: order.shippingLabelId || "",
          labelUrl: order.shippingLabelUrl || "",
          price: Number(order.shippingCost),
          trackingCode: order.trackingCode || "",
        };
      }

      const settings = await getSiteSettings();
      const token = process.env.MELHOR_ENVIO_TOKEN;
      const cepOrigem = process.env.CEP_ORIGEM || "22000000";

      // 2. Local Simulation Mode / Fallback
      if (isSimulation || !token) {
        console.log(`Running in Simulation Mode for Order ${orderId}...`);
        
        // Generate simulated tracking code and label ID
        const randNum = Math.floor(100000000 + Math.random() * 900000000).toString();
        const trackingCode = `QH${randNum}BR`; // Correios format
        const labelId = `me_sim_${Math.floor(Date.now() / 1000)}_${orderCodeOf(order.id)}`;
        const labelUrl = `/admin/pedidos/${order.id}/etiqueta`; // Internal printable HTML label
        
        const price = Number(order.shippingCost) > 0 ? Number(order.shippingCost) : 14.90;

        await this.updateOrderInDb(order.id, labelId, labelUrl, price, trackingCode);

        return {
          ok: true,
          labelId,
          labelUrl,
          price,
          trackingCode,
        };
      }

      // 3. Real Integration Workflow
      const addr = order.shippingAddress;
      const isSedex = order.shippingMethod?.toUpperCase() === "SEDEX";
      // Melhor Envio Service IDs: 1 = PAC (Correios), 2 = SEDEX (Correios)
      const serviceId = isSedex ? 2 : 1;

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "EraUmaVezEu (atendimento@eraumavezeu.com.br)",
      };

      const apiUrl = this.getApiUrl();

      // Step 3a: Add shipment to cart
      const cartPayload = {
        service: serviceId,
        from: {
          name: settings.siteName || "Era Uma Vez Eu",
          phone: settings.whatsappNumber.replace(/\D/g, ""),
          email: settings.contactEmail,
          document: settings.cnpj.replace(/\D/g, ""),
          address: "Avenida Rio Branco",
          number: "156",
          complement: "Sala 2602",
          district: "Centro",
          city: "Rio de Janeiro",
          state: "RJ",
          postal_code: cepOrigem.replace(/\D/g, ""),
        },
        to: {
          name: addr.name,
          phone: order.guestPhone ? order.guestPhone.replace(/\D/g, "") : "21975128634",
          email: order.guestEmail || "cliente@eraumavezeu.com.br",
          document: order.guestCpf ? order.guestCpf.replace(/\D/g, "") : "",
          address: addr.street,
          number: addr.number,
          complement: addr.complement || "",
          district: addr.district,
          city: addr.city,
          state: addr.state.toUpperCase(),
          postal_code: addr.zipCode.replace(/\D/g, ""),
        },
        volumes: [
          {
            height: 4, // 4cm
            width: 22, // 22cm
            length: 31, // 31cm
            weight: 0.6, // 600g
          },
        ],
        options: {
          insurance_value: Number(order.total),
          receipt: false,
          own_hand: false,
          reverse: false,
          non_commercial: !order.nfeKey, // True if no NFe is generated
          ...(order.nfeKey ? { invoice: { key: order.nfeKey } } : {}),
        },
      };

      console.log("Melhor Envio: Adding item to cart...");
      const cartRes = await fetch(`${apiUrl}/api/v2/me/cart`, {
        method: "POST",
        headers,
        body: JSON.stringify(cartPayload),
      });

      if (!cartRes.ok) {
        const errText = await cartRes.text();
        console.error("Melhor Envio Cart Error:", errText);
        throw new Error(`Erro ao adicionar no carrinho do Melhor Envio: ${errText}`);
      }

      const cartData = await cartRes.json();
      const meOrderId = cartData.id; // Melhor Envio internal item ID

      // Step 3b: Checkout (purchase the shipping label)
      console.log(`Melhor Envio: Checking out order ${meOrderId}...`);
      const checkoutRes = await fetch(`${apiUrl}/api/v2/me/shipment/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify({ orders: [meOrderId] }),
      });

      if (!checkoutRes.ok) {
        const errText = await checkoutRes.text();
        console.error("Melhor Envio Checkout Error:", errText);
        throw new Error(`Erro no checkout do Melhor Envio: ${errText}`);
      }

      // Step 3c: Generate the label
      console.log(`Melhor Envio: Requesting label generation for ${meOrderId}...`);
      const generateRes = await fetch(`${apiUrl}/api/v2/me/shipment/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ orders: [meOrderId] }),
      });

      if (!generateRes.ok) {
        const errText = await generateRes.text();
        console.error("Melhor Envio Generate Error:", errText);
        throw new Error(`Erro ao gerar etiqueta no Melhor Envio: ${errText}`);
      }

      // Step 3d: Get print link
      console.log(`Melhor Envio: Fetching label printing link for ${meOrderId}...`);
      const printRes = await fetch(`${apiUrl}/api/v2/me/shipment/print`, {
        method: "POST",
        headers,
        body: JSON.stringify({ mode: "pdf", orders: [meOrderId] }),
      });

      if (!printRes.ok) {
        const errText = await printRes.text();
        console.error("Melhor Envio Print Error:", errText);
        throw new Error(`Erro ao obter link de impressão no Melhor Envio: ${errText}`);
      }

      const printData = await printRes.json();
      const labelUrl = printData.url || ""; // External PDF URL
      const trackingCode = cartData.tracking || `ME${meOrderId.slice(-8)}`;
      const price = Number(cartData.price || order.shippingCost);

      await this.updateOrderInDb(order.id, meOrderId, labelUrl, price, trackingCode);

      return {
        ok: true,
        labelId: meOrderId,
        labelUrl,
        price,
        trackingCode,
      };
    } catch (err: any) {
      console.error("MelhorEnvioService.generateLabel failed:", err);
      return { ok: false, error: err.message || "Erro interno ao emitir etiqueta de envio." };
    }
  }

  /**
   * Helper to update DB and tracking info.
   */
  private static async updateOrderInDb(
    orderId: string,
    labelId: string,
    labelUrl: string,
    price: number,
    trackingCode: string
  ) {
    await db.$transaction([
      db.order.update({
        where: { id: orderId },
        data: {
          shippingLabelId: labelId,
          shippingLabelUrl: labelUrl,
          shippingLabelStatus: "GERADA",
          shippingLabelPrice: price,
          trackingCode: trackingCode,
          status: "AGUARDANDO_ENVIO", // Auto advance to AGUARDANDO_ENVIO when label is ready!
        },
      }),
      db.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: null,
          toStatus: "AGUARDANDO_ENVIO",
          changedBy: "system_shipping",
          note: `Etiqueta de envio emitida com sucesso (${trackingCode}). Custou R$ ${price.toFixed(2)}.`,
        },
      }),
    ]);
  }
}
