import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { orderCodeOf } from "@/lib/orders/build-order";

// lê o banco a cada request — nunca prerender (id é cuid não-enumerável)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pedido recebido",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  PAGAMENTO_CONFIRMADO: "Pagamento confirmado",
  EM_PRODUCAO: "Em produção",
  AGUARDANDO_ENVIO: "Aguardando envio",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export default async function PedidoPage({ params }: { params: { id: string } }) {
  const order = await db.order
    .findUnique({
      where: { id: params.id },
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
      },
    })
    .catch(() => null);

  if (!order) notFound();

  const code = orderCodeOf(order.id);
  const address = order.shippingAddress;

  return (
    <section className="py-10 md:py-16 bg-cream-warm min-h-[70vh]">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="card-premium p-8 md:p-10 text-center">
          <p className="badge-gold">Pedido #{code}</p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-primary">
            Pedido recebido! 🎉
          </h1>
          <p className="mt-3 text-dark/70 leading-relaxed">
            Obrigado, {order.guestName?.split(" ")[0] ?? "cliente"}! Seu pedido foi
            registrado e nossa equipe vai entrar em contato pelo WhatsApp para
            confirmar as fotos e enviar o link de pagamento.
          </p>
          <p className="mt-4 inline-block rounded-full border border-gold/30 bg-cream px-4 py-1.5 text-sm font-medium text-primary">
            Status: {STATUS_LABELS[order.status] ?? order.status}
          </p>
        </div>

        <div className="card-premium mt-6 p-6 md:p-8">
          <h2 className="font-serif text-2xl text-primary">Itens</h2>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-3 border-b border-gold/20 pb-3 text-sm"
              >
                <div>
                  <p className="font-medium text-primary">{item.product.name}</p>
                  <p className="text-xs text-dark/60">Qtd. {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-dark">
                    {formatBRL(Number(item.price) * item.quantity)}
                  </p>
                  {Number(item.discount) > 0 && (
                    <p className="text-xs text-forest">
                      - {formatBRL(Number(item.discount))} combo
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-dark/65">Subtotal</dt>
              <dd>{formatBRL(Number(order.subtotal))}</dd>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-forest">
                <dt>Desconto combo</dt>
                <dd>- {formatBRL(Number(order.discount))}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-gold/25 pt-3 text-lg">
              <dt className="font-semibold text-primary">Total</dt>
              <dd className="font-serif text-fox font-bold">{formatBRL(Number(order.total))}</dd>
            </div>
          </dl>
        </div>

        {address && (
          <div className="card-premium mt-6 p-6 md:p-8">
            <h2 className="font-serif text-2xl text-primary">Entrega</h2>
            <p className="mt-3 text-sm text-dark/70 leading-relaxed">
              {address.street}, {address.number}
              {address.complement ? ` — ${address.complement}` : ""}
              <br />
              {address.district} — {address.city}/{address.state}
              <br />
              CEP {address.zipCode.replace(/(\d{5})(\d{3})/, "$1-$2")}
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="btn-primary inline-flex">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </section>
  );
}
