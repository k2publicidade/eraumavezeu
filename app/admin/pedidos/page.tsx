import Link from "next/link";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { orderCodeOf } from "@/lib/orders/build-order";
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  type OrderStatusValue,
} from "@/lib/orders/status";

export const dynamic = "force-dynamic";

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const statusFilter = ORDER_STATUSES.includes(searchParams.status as OrderStatusValue)
    ? (searchParams.status as OrderStatusValue)
    : undefined;
  const query = searchParams.q?.trim();

  const where = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(query
      ? {
          OR: [
            { id: { contains: query } },
            { guestName: { contains: query, mode: "insensitive" as const } },
            { guestEmail: { contains: query, mode: "insensitive" as const } },
            { guestPhone: { contains: query } },
          ],
        }
      : {}),
  };

  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 150,
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        guestPhone: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
        trackingCode: true,
      },
    }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countOf = new Map(counts.map((c) => [c.status as string, c._count._all]));
  const totalCount = counts.reduce((acc, c) => acc + c._count._all, 0);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-fox">Vendas</p>
          <h1 className="mt-2 font-serif text-4xl text-primary">Pedidos</h1>
          <p className="mt-2 text-dark/60">Controle pagamentos, produção, rastreio e entregas.</p>
        </div>
        <Link href="/admin" className="btn-ghost">← Dashboard</Link>
      </div>

      <form className="mt-6 flex flex-col gap-3 rounded-3xl border border-gold/25 bg-cream-light p-4 sm:flex-row" action="/admin/pedidos">
        <input
          name="q"
          defaultValue={query}
          placeholder="Buscar por nome, e-mail, telefone ou ID"
          className="input-field flex-1"
          aria-label="Buscar pedidos"
        />
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <button className="btn-primary justify-center" type="submit">Buscar</button>
        {(query || statusFilter) && <Link href="/admin/pedidos" className="btn-ghost justify-center">Limpar</Link>}
      </form>

      <nav className="mt-5 flex flex-wrap gap-2 text-sm" aria-label="Filtrar por status">
        <Link
          href="/admin/pedidos"
          className={`rounded-full border px-3 py-1.5 transition-colors ${
            !statusFilter ? "border-primary bg-primary text-white" : "border-gold/40 bg-cream-light text-primary hover:border-primary"
          }`}
        >
          Todos ({totalCount})
        </Link>
        {ORDER_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/pedidos?status=${status}`}
            className={`rounded-full border px-3 py-1.5 transition-colors ${
              statusFilter === status ? "border-primary bg-primary text-white" : "border-gold/40 bg-cream-light text-primary hover:border-primary"
            }`}
          >
            {STATUS_LABELS[status]} ({countOf.get(status) ?? 0})
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-gold/25 bg-cream-light p-8 text-center text-dark/60">Nenhum pedido encontrado.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-3xl border border-gold/25 bg-cream-light">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/25 text-left text-primary">
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Pagamento</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Rastreio</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gold/15 last:border-0 hover:bg-cream">
                  <td className="px-4 py-3">
                    <Link href={`/admin/pedidos/${order.id}`} className="font-medium text-primary underline-offset-2 hover:underline">
                      #{orderCodeOf(order.id)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-dark/70">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className="text-dark">{order.guestName ?? "Cliente"}</span>
                    <span className="block text-xs text-dark/55">{order.guestEmail}</span>
                    {order.guestPhone && <span className="block text-xs text-dark/45">{order.guestPhone}</span>}
                  </td>
                  <td className="px-4 py-3 font-medium text-dark">{formatBRL(Number(order.total))}</td>
                  <td className="px-4 py-3 text-dark/70">{order.paymentStatus}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-gold/30 bg-cream px-2.5 py-1 text-xs text-primary">
                      {STATUS_LABELS[order.status as OrderStatusValue] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-dark/60">{order.trackingCode ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
