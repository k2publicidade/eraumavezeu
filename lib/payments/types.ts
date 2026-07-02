import type { Order, OrderItem, Product, Address } from "@prisma/client";

export type OrderWithDetails = Order & {
  items: (OrderItem & { product: Product })[];
  shippingAddress: Address | null;
};

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentId?: string;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  error?: string;
}

export interface WebhookResult {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  paymentStatus?: "PENDENTE" | "APROVADO" | "REJEITADO" | "REEMBOLSADO";
  orderStatus?: "AGUARDANDO_PAGAMENTO" | "PAGAMENTO_CONFIRMADO" | "CANCELADO";
  paymentMethod?: string;
  error?: string;
}

export interface PaymentGateway {
  name: string;
  createPayment(order: OrderWithDetails): Promise<PaymentResponse>;
  processWebhook(req: Request): Promise<WebhookResult>;
}
