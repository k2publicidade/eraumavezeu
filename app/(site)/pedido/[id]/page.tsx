import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { orderCodeOf } from "@/lib/orders/build-order";
import { statusLabelOf } from "@/lib/orders/status";
import { getOrCreatePaymentUrl } from "@/lib/mercadopago";

// lê o banco a cada request — nunca prerender (id é cuid não-enumerável)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pedido recebido",
  robots: { index: false, follow: false },
};

interface PedidoPageProps {
  params: { id: string };
  searchParams: { payment?: string };
}

export default async function PedidoPage({ params, searchParams }: PedidoPageProps) {
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
  const buyerFirstName = order.guestName?.split(" ")[0] ?? "cliente";

  // Determina se exibe o botão de pagamento
  const isAwaitingPayment = order.status === "AGUARDANDO_PAGAMENTO";
  const paymentUrl = isAwaitingPayment ? await getOrCreatePaymentUrl(order.id) : null;

  // Estado do pagamento baseado nos query params ou no banco
  const isPaid = order.paymentStatus === "APROVADO" || searchParams.payment === "success";
  const isPending = searchParams.payment === "pending";
  const isFailure = searchParams.payment === "failure";

  return (
    <section className="py-10 md:py-16 bg-cream-warm min-h-[70vh]">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Banner de Status de Pagamento (Feedback) */}
        {isPaid && (
          <div className="mb-6 rounded-3xl border border-forest/30 bg-forest/10 p-5 text-forest flex items-start gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <h3 className="font-semibold text-lg">Pagamento Confirmado!</h3>
              <p className="text-sm text-forest/95 mt-1">
                Recebemos a confirmação do seu pagamento. Seu livro personalizado já entrou na nossa fila de produção!
              </p>
            </div>
          </div>
        )}

        {isPending && !isPaid && (
          <div className="mb-6 rounded-3xl border border-amber-300 bg-amber-50 p-5 text-amber-900 flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h3 className="font-semibold text-lg">Pagamento em Processamento</h3>
              <p className="text-sm text-amber-900/90 mt-1">
                O Mercado Pago está processando a transação. Assim que for concluído, iniciaremos a produção do seu pedido.
              </p>
            </div>
          </div>
        )}

        {isFailure && !isPaid && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-lg">Falha no Pagamento</h3>
              <p className="text-sm text-red-700/95 mt-1">
                Não conseguimos validar o pagamento com o Mercado Pago. Por favor, tente novamente utilizando o botão de pagamento abaixo.
              </p>
            </div>
          </div>
        )}

        <div className="card-premium p-8 md:p-10 text-center">
          <p className="badge-gold">Pedido #{code}</p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-primary">
            {isPaid ? "Pagamento Confirmado! 🎉" : "Pedido recebido!"}
          </h1>
          
          <p className="mt-3 text-dark/70 leading-relaxed">
            {isPaid ? (
              `Olá, ${buyerFirstName}! Seu livro está em boas mãos. Nossa equipe irá gerar as ilustrações com inteligência artificial e fazer a montagem manual com todo o carinho.`
            ) : (
              `Obrigado, ${buyerFirstName}! Seu pedido foi registrado no sistema. Pague agora para iniciar a produção do livro ou aguarde as instruções enviadas para o seu e-mail.`
            )}
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3">
            <span className="inline-block rounded-full border border-gold/30 bg-cream px-4 py-1.5 text-sm font-medium text-primary">
              Status: {statusLabelOf(isPaid ? "PAGAMENTO_CONFIRMADO" : order.status)}
            </span>
            {order.trackingCode && (
              <p className="text-sm text-dark/70">
                Código de rastreio: <strong>{order.trackingCode}</strong>
              </p>
            )}
          </div>

          {/* Botão de Pagamento Mercado Pago */}
          {isAwaitingPayment && !isPaid && paymentUrl && (
            <div className="mt-8 border-t border-gold/15 pt-8">
              <h3 className="text-sm font-medium text-dark/60 uppercase tracking-wider">Forma de Pagamento</h3>
              <p className="mt-2 text-sm text-dark/80">PIX, Cartão de Crédito em até 12x ou Boleto via Mercado Pago</p>
              
              <a
                href={paymentUrl}
                className="btn-primary inline-flex items-center justify-center gap-2 mt-4 px-8 py-3.5 text-base shadow-lg shadow-gold/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
              >
                <span>Pagar Agora com Mercado Pago</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>

              <div className="mt-4 flex items-center justify-center gap-6 text-xs text-dark/50">
                <span className="flex items-center gap-1">🔒 Ambiente 100% Seguro</span>
                <span>⚡ Confirmação Instantânea</span>
              </div>
            </div>
          )}
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

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn-primary inline-flex">
            Voltar para a página inicial
          </Link>
          <Link
            href="/pedidos"
            className="inline-flex items-center text-sm text-dark/60 hover:text-primary"
          >
            Acompanhar meus pedidos →
          </Link>
        </div>
      </div>
    </section>
  );
}
