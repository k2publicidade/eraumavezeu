import Link from "next/link";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { calculateAdminMetrics, countOrdersByStatus } from "@/lib/admin/metrics";
import { orderCodeOf } from "@/lib/orders/build-order";
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatusValue } from "@/lib/orders/status";

export const dynamic = "force-dynamic";

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-gold/25 bg-cream-light p-5 shadow-sm">
      <p className="text-sm text-dark/55">{label}</p>
      <p className="mt-2 font-serif text-3xl text-primary">{value}</p>
      <p className="mt-1 text-xs text-dark/50">{hint}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [orders, productsCount, customersCount] = await Promise.all([
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
      },
    }),
    db.product.count({ where: { active: true } }),
    db.user.count(),
  ]);

  const metricOrders = orders.map((order) => ({
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: Number(order.total),
    createdAt: order.createdAt,
  }));
  const metrics = calculateAdminMetrics(metricOrders);
  const statusCounts = countOrdersByStatus(metricOrders);
  const latestOrders = orders.slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-fox">Admin</p>
          <h1 className="mt-2 font-serif text-4xl text-primary">Dashboard</h1>
          <p className="mt-2 text-dark/60">Visão geral de vendas, produção e operação.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/pedidos" className="btn-primary">Ver pedidos</Link>
          <Link href="/admin/produtos" className="btn-ghost">Gerenciar catálogo</Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
        <StatCard label="Receita total" value={formatBRL(metrics.totalRevenue)} hint={`${metrics.totalOrders} pedidos registrados`} />
        <StatCard label="Receita do mês" value={formatBRL(metrics.monthRevenue)} hint={`${metrics.monthOrders} pedidos neste mês`} />
        <StatCard label="Ticket médio" value={formatBRL(metrics.averageTicket)} hint={`${metrics.paidOrders} pagamentos aprovados`} />
        <StatCard label="Catálogo ativo" value={String(productsCount)} hint={`${customersCount} contas cadastradas`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-gold/25 bg-cream-light p-6">
          <h2 className="font-serif text-2xl text-primary">Fila operacional</h2>
          <div className="mt-5 grid gap-3">
            <Link href="/admin/pedidos?status=AGUARDANDO_PAGAMENTO" className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 text-sm">
              <span>Pagamentos pendentes</span><strong className="text-primary">{metrics.pendingPayment}</strong>
            </Link>
            <Link href="/admin/producao" className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 text-sm">
              <span>Em produção</span><strong className="text-primary">{metrics.productionQueue}</strong>
            </Link>
            <Link href="/admin/pedidos?status=AGUARDANDO_ENVIO" className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 text-sm">
              <span>Aguardando envio</span><strong className="text-primary">{metrics.shippingQueue}</strong>
            </Link>
            <Link href="/admin/pedidos?status=CANCELADO" className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 text-sm">
              <span>Cancelados</span><strong className="text-primary">{metrics.cancelledOrders}</strong>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-gold/25 bg-cream-light p-6">
          <h2 className="font-serif text-2xl text-primary">Pedidos por status</h2>
          <div className="mt-5 space-y-3">
            {ORDER_STATUSES.map((status) => {
              const count = statusCounts[status];
              const pct = metrics.totalOrders ? Math.round((count / metrics.totalOrders) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm text-dark/70">
                    <span>{STATUS_LABELS[status]}</span><span>{count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-gold/15">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gold/25 bg-cream-light p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl text-primary">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm text-primary underline-offset-2 hover:underline">Ver todos</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/25 text-left text-primary">
                <th className="px-3 py-3 font-medium">Pedido</th>
                <th className="px-3 py-3 font-medium">Cliente</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Total</th>
                <th className="px-3 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.map((order) => (
                <tr key={order.id} className="border-b border-gold/15 last:border-0">
                  <td className="px-3 py-3"><Link className="font-medium text-primary hover:underline" href={`/admin/pedidos/${order.id}`}>#{orderCodeOf(order.id)}</Link></td>
                  <td className="px-3 py-3"><span>{order.guestName ?? "Cliente"}</span><span className="block text-xs text-dark/50">{order.guestEmail}</span></td>
                  <td className="px-3 py-3"><span className="rounded-full border border-gold/30 bg-cream px-2.5 py-1 text-xs text-primary">{STATUS_LABELS[order.status as OrderStatusValue]}</span></td>
                  <td className="px-3 py-3 font-medium">{formatBRL(Number(order.total))}</td>
                  <td className="px-3 py-3 text-dark/60">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {latestOrders.length === 0 && <p className="py-8 text-center text-dark/55">Nenhum pedido ainda.</p>}
        </div>
      </section>
    </div>
  );
}
