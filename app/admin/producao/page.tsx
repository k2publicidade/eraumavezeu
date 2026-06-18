import Link from "next/link";
import { db } from "@/lib/db";
import { orderCodeOf } from "@/lib/orders/build-order";
import { statusLabelOf } from "@/lib/orders/status";

export const dynamic = "force-dynamic";

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(d);
}

export default async function AdminProductionPage() {
  const [productionOrders, expiringPhotos] = await Promise.all([
    db.order.findMany({
      where: { status: { in: ["PAGAMENTO_CONFIRMADO", "EM_PRODUCAO", "AGUARDANDO_ENVIO"] } },
      orderBy: { createdAt: "asc" },
      include: { customization: true, items: { include: { product: true } } },
      take: 100,
    }),
    db.customization.findMany({
      where: { photosExpireAt: { not: null } },
      orderBy: { photosExpireAt: "asc" },
      take: 20,
      include: { order: { select: { id: true, guestName: true, status: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-fox">Operação</p>
        <h1 className="mt-2 font-serif text-4xl text-primary">Produção</h1>
        <p className="mt-2 text-dark/60">Fila de livros, prompts, fotos e retenção LGPD.</p>
      </div>

      <section className="rounded-3xl border border-gold/25 bg-cream-light p-6">
        <h2 className="font-serif text-2xl text-primary">Fila de produção</h2>
        <div className="mt-5 grid gap-4">
          {productionOrders.map((order) => (
            <Link key={order.id} href={`/admin/pedidos/${order.id}`} className="rounded-2xl border border-gold/20 bg-cream p-4 transition hover:border-primary/40">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-primary">Pedido #{orderCodeOf(order.id)} · {order.guestName ?? "Cliente"}</p>
                  <p className="mt-1 text-sm text-dark/60">{order.customization ? `${order.customization.childName} · ${order.customization.theme} · ${order.customization.artStyle}` : "Sem personalização vinculada"}</p>
                  <p className="mt-1 text-xs text-dark/45">Criado em {formatDate(order.createdAt)} · {order.items.map((item) => `${item.quantity}x ${item.product.name}`).join(", ")}</p>
                </div>
                <span className="w-fit rounded-full border border-gold/30 bg-cream-light px-3 py-1 text-xs text-primary">{statusLabelOf(order.status)}</span>
              </div>
              {order.customization?.aiPrompt ? (
                <p className="mt-3 line-clamp-2 rounded-xl bg-white/60 p-3 text-xs text-dark/60">{order.customization.aiPrompt}</p>
              ) : (
                <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">Prompt de IA ausente — revisar personalização.</p>
              )}
            </Link>
          ))}
          {productionOrders.length === 0 && <p className="rounded-2xl bg-cream p-6 text-center text-dark/55">Nenhum pedido na fila.</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-gold/25 bg-cream-light p-6">
        <h2 className="font-serif text-2xl text-primary">Retenção LGPD de fotos</h2>
        <p className="mt-1 text-sm text-dark/55">Fotos expiram após entrega. Esta lista ajuda a auditar os próximos vencimentos.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/25 text-left text-primary">
                <th className="px-3 py-3 font-medium">Pedido</th>
                <th className="px-3 py-3 font-medium">Cliente</th>
                <th className="px-3 py-3 font-medium">Fotos</th>
                <th className="px-3 py-3 font-medium">Expira em</th>
              </tr>
            </thead>
            <tbody>
              {expiringPhotos.map((custom) => (
                <tr key={custom.id} className="border-b border-gold/15 last:border-0">
                  <td className="px-3 py-3"><Link href={`/admin/pedidos/${custom.orderId}`} className="text-primary hover:underline">#{orderCodeOf(custom.orderId)}</Link></td>
                  <td className="px-3 py-3">{custom.order.guestName ?? "Cliente"}</td>
                  <td className="px-3 py-3">{custom.photoKeys.length}</td>
                  <td className="px-3 py-3">{custom.photosExpireAt ? formatDate(custom.photosExpireAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {expiringPhotos.length === 0 && <p className="py-6 text-center text-dark/55">Nenhuma expiração programada.</p>}
        </div>
      </section>
    </div>
  );
}
