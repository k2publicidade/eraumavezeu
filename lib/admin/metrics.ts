import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { ORDER_STATUSES, type OrderStatusValue } from "@/lib/orders/status";

export type AdminMetricOrder = {
  id: string;
  status: OrderStatus | OrderStatusValue;
  paymentStatus: PaymentStatus | "PENDENTE" | "APROVADO" | "REJEITADO" | "REEMBOLSADO";
  total: number;
  createdAt: Date;
};

export type AdminMetrics = {
  totalOrders: number;
  monthOrders: number;
  paidOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  monthRevenue: number;
  averageTicket: number;
  productionQueue: number;
  shippingQueue: number;
  pendingPayment: number;
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function isRevenueOrder(order: AdminMetricOrder): boolean {
  return order.status !== "CANCELADO" && order.paymentStatus !== "REJEITADO";
}

export function monthRangeOf(now = new Date()): { start: Date; end: Date } {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

export function countOrdersByStatus(
  orders: Pick<AdminMetricOrder, "status">[],
): Record<OrderStatusValue, number> {
  const counts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<
    OrderStatusValue,
    number
  >;

  for (const order of orders) {
    if (ORDER_STATUSES.includes(order.status as OrderStatusValue)) {
      counts[order.status as OrderStatusValue] += 1;
    }
  }

  return counts;
}

export function calculateAdminMetrics(
  orders: AdminMetricOrder[],
  now = new Date(),
): AdminMetrics {
  const { start, end } = monthRangeOf(now);
  const revenueOrders = orders.filter(isRevenueOrder);
  const monthRevenueOrders = revenueOrders.filter(
    (order) => order.createdAt >= start && order.createdAt < end,
  );

  const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.total, 0);
  const monthRevenue = monthRevenueOrders.reduce((sum, order) => sum + order.total, 0);

  return {
    totalOrders: orders.length,
    monthOrders: orders.filter((order) => order.createdAt >= start && order.createdAt < end).length,
    paidOrders: orders.filter((order) => order.paymentStatus === "APROVADO").length,
    cancelledOrders: orders.filter((order) => order.status === "CANCELADO").length,
    totalRevenue: roundMoney(totalRevenue),
    monthRevenue: roundMoney(monthRevenue),
    averageTicket: revenueOrders.length ? roundMoney(totalRevenue / revenueOrders.length) : 0,
    productionQueue: orders.filter((order) => order.status === "EM_PRODUCAO").length,
    shippingQueue: orders.filter((order) => order.status === "AGUARDANDO_ENVIO").length,
    pendingPayment: orders.filter((order) => order.status === "AGUARDANDO_PAGAMENTO").length,
  };
}
