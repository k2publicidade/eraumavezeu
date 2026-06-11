import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { orderCodeOf } from "@/lib/orders/build-order";
import { statusLabelOf } from "@/lib/orders/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meus pedidos",
  robots: { index: false, follow: false },
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(d);
}

export default async function MeusPedidosPage() {
  const user = await requireAuth();

  // inclui pedidos feitos como convidado com o mesmo e-mail da conta
  const orders = await db.order.findMany({
    where: {
      OR: [
        { userId: user.id },
        ...(user.email ? [{ guestEmail: user.email }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      total: true,
      trackingCode: true,
      createdAt: true,
      items: { select: { quantity: true, product: { select: { name: true } } } },
    },
  });

  return (
    <section className="py-10 md:py-16 bg-cream-warm min-h-[70vh]">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-serif text-3xl md:text-4xl text-primary">Meus pedidos</h1>

        {orders.length === 0 ? (
          <div className="card-premium mt-8 p-10 text-center">
            <p className="text-dark/65">Você ainda não tem pedidos.</p>
            <Link href="/personalizar" className="btn-primary-lg mt-6 inline-flex">
              Criar meu livro
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/pedido/${order.id}`}
                className="card-premium block p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-serif text-xl text-primary">
                      Pedido #{orderCodeOf(order.id)}
                    </p>
                    <p className="mt-1 text-sm text-dark/60">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full border border-gold/30 bg-cream px-3 py-1 text-xs text-primary">
                      {statusLabelOf(order.status)}
                    </span>
                    <p className="mt-2 font-serif font-bold text-fox">
                      {formatBRL(Number(order.total))}
                    </p>
                  </div>
                </div>
                <p className="mt-3 border-t border-gold/20 pt-3 text-sm text-dark/70">
                  {order.items
                    .map((it) => `${it.quantity}x ${it.product.name}`)
                    .join(" · ")}
                </p>
                {order.trackingCode && (
                  <p className="mt-2 text-xs text-dark/60">
                    Rastreio: <span className="font-medium">{order.trackingCode}</span>
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
