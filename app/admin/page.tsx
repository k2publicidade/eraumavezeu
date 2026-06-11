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
  searchParams: { status?: string };
}) {
  const statusFilter = ORDER_STATUSES.includes(
    searchParams.status as OrderStatusValue,
  )
    ? (searchParams.status as OrderStatusValue)
    : undefined;

  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        status: true,
        total: true,
        createdAt: true,
      },
    }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countOf = new Map(counts.map((c) => [c.status as string, c._count._all]));
  const totalCount = counts.reduce((acc, c) => acc + c._count._all, 0);

  return (
    <div>
      <h1 className="font-serif text-3xl text-primary">Pedidos</h1>

      <nav className="mt-5 flex flex-wrap gap-2 text-sm" aria-label="Filtrar por status">
        <Link
          href="/admin"
          className={`rounded-full border px-3 py-1.5 transition-colors ${
            !statusFilter
              ? "border-primary bg-primary text-white"
              : "border-gold/40 bg-cream-light text-primary hover:border-primary"
          }`}
        >
          Todos ({totalCount})
        </Link>
        {ORDER_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin?status=${status}`}
            className={`rounded-full border px-3 py-1.5 transition-colors ${
              statusFilter === status
                ? "border-primary bg-primary text-white"
                : "border-gold/40 bg-cream-light text-primary hover:border-primary"
            }`}
          >
            {STATUS_LABELS[status]} ({countOf.get(status) ?? 0})
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="mt-10 text-dark/60">Nenhum pedido {statusFilter ? "nesse status" : "ainda"}.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-gold/25 bg-cream-light">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/25 text-left text-primary">
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gold/15 last:border-0 hover:bg-cream">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      #{orderCodeOf(order.id)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-dark/70">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className="text-dark">{order.guestName}</span>
                    <span className="block text-xs text-dark/55">{order.guestEmail}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-dark">{formatBRL(Number(order.total))}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-gold/30 bg-cream px-2.5 py-1 text-xs text-primary">
                      {STATUS_LABELS[order.status as OrderStatusValue] ?? order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
