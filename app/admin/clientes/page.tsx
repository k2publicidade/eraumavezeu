import Link from "next/link";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(d);
}

export default async function AdminCustomersPage() {
  const [users, guestOrders] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        orders: { select: { id: true, total: true, status: true } },
      },
    }),
    db.order.findMany({
      where: { userId: null, guestEmail: { not: null } },
      select: { id: true, guestName: true, guestEmail: true, guestPhone: true, total: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
  ]);

  const guests = new Map<string, { name: string | null; email: string; phone: string | null; orders: typeof guestOrders }>();
  for (const order of guestOrders) {
    if (!order.guestEmail) continue;
    const current = guests.get(order.guestEmail) ?? { name: order.guestName, email: order.guestEmail, phone: order.guestPhone, orders: [] };
    current.orders.push(order);
    guests.set(order.guestEmail, current);
  }

  const rows = [
    ...users.map((user) => ({
      key: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      ordersCount: user.orders.length,
      total: user.orders.filter((o) => o.status !== "CANCELADO").reduce((sum, o) => sum + Number(o.total), 0),
      lastOrderId: user.orders[0]?.id ?? null,
    })),
    ...Array.from(guests.values()).map((guest) => ({
      key: `guest-${guest.email}`,
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      role: "CONVIDADO",
      createdAt: guest.orders[guest.orders.length - 1]?.createdAt ?? new Date(),
      ordersCount: guest.orders.length,
      total: guest.orders.filter((o) => o.status !== "CANCELADO").reduce((sum, o) => sum + Number(o.total), 0),
      lastOrderId: guest.orders[0]?.id ?? null,
    })),
  ].sort((a, b) => b.ordersCount - a.ordersCount || b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div>
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-fox">Relacionamento</p>
        <h1 className="mt-2 font-serif text-4xl text-primary">Clientes</h1>
        <p className="mt-2 text-dark/60">Contas cadastradas e compradores convidados agrupados por e-mail.</p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl border border-gold/25 bg-cream-light">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/25 text-left text-primary">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Pedidos</th>
              <th className="px-4 py-3 font-medium">Total comprado</th>
              <th className="px-4 py-3 font-medium">Desde</th>
              <th className="px-4 py-3 font-medium">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-gold/15 last:border-0 hover:bg-cream">
                <td className="px-4 py-3">
                  <p className="font-medium text-dark">{row.name ?? "Cliente"}</p>
                  <p className="text-xs text-dark/55">{row.email}</p>
                  {row.phone && <p className="text-xs text-dark/45">{row.phone}</p>}
                </td>
                <td className="px-4 py-3"><span className="rounded-full border border-gold/30 bg-cream px-2.5 py-1 text-xs text-primary">{row.role}</span></td>
                <td className="px-4 py-3 text-dark/70">{row.ordersCount}</td>
                <td className="px-4 py-3 font-medium text-primary">{formatBRL(row.total)}</td>
                <td className="px-4 py-3 text-dark/60">{formatDate(row.createdAt)}</td>
                <td className="px-4 py-3">{row.lastOrderId ? <Link href={`/admin/pedidos/${row.lastOrderId}`} className="text-primary hover:underline">Último pedido</Link> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-8 text-center text-dark/55">Nenhum cliente ainda.</p>}
      </div>
    </div>
  );
}
