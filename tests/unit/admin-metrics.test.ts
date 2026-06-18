import { describe, expect, it } from "vitest";
import {
  calculateAdminMetrics,
  countOrdersByStatus,
  monthRangeOf,
  type AdminMetricOrder,
} from "@/lib/admin/metrics";

function order(input: Partial<AdminMetricOrder> = {}): AdminMetricOrder {
  return {
    id: input.id ?? Math.random().toString(36),
    status: input.status ?? "PAGAMENTO_CONFIRMADO",
    paymentStatus: input.paymentStatus ?? "APROVADO",
    total: input.total ?? 100,
    createdAt: input.createdAt ?? new Date("2026-06-10T12:00:00Z"),
  };
}

describe("admin metrics", () => {
  it("calcula receita, ticket médio e pendências ignorando cancelados", () => {
    const metrics = calculateAdminMetrics([
      order({ total: 250, status: "PAGAMENTO_CONFIRMADO" }),
      order({ total: 150, status: "EM_PRODUCAO" }),
      order({ total: 90, status: "AGUARDANDO_ENVIO" }),
      order({ total: 70, status: "CANCELADO", paymentStatus: "REJEITADO" }),
    ], new Date("2026-06-17T12:00:00Z"));

    expect(metrics.totalRevenue).toBe(490);
    expect(metrics.monthRevenue).toBe(490);
    expect(metrics.averageTicket).toBe(163.33);
    expect(metrics.productionQueue).toBe(1);
    expect(metrics.shippingQueue).toBe(1);
    expect(metrics.cancelledOrders).toBe(1);
  });

  it("separa mês atual do histórico", () => {
    const metrics = calculateAdminMetrics([
      order({ total: 100, createdAt: new Date("2026-06-01T03:00:00Z") }),
      order({ total: 200, createdAt: new Date("2026-05-31T22:00:00Z") }),
    ], new Date("2026-06-17T12:00:00Z"));

    expect(metrics.totalRevenue).toBe(300);
    expect(metrics.monthRevenue).toBe(100);
    expect(metrics.monthOrders).toBe(1);
  });

  it("conta pedidos por status incluindo status zerados", () => {
    const counts = countOrdersByStatus([
      order({ status: "AGUARDANDO_PAGAMENTO" }),
      order({ status: "AGUARDANDO_PAGAMENTO" }),
      order({ status: "ENTREGUE" }),
    ]);

    expect(counts.AGUARDANDO_PAGAMENTO).toBe(2);
    expect(counts.ENTREGUE).toBe(1);
    expect(counts.EM_PRODUCAO).toBe(0);
  });

  it("calcula range mensal local", () => {
    const range = monthRangeOf(new Date("2026-06-17T12:00:00Z"));
    expect(range.start.getDate()).toBe(1);
    expect(range.end.getMonth()).toBe(range.start.getMonth() + 1);
  });
});
