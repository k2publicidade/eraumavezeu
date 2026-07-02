import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { orderCodeOf } from "@/lib/orders/build-order";
import { statusLabelOf } from "@/lib/orders/status";
import { PixCopyButton } from "@/components/payments/PixCopyButton";
// import do mercadopago removido para usar gateway registry dinâmico

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

  // Determina se exibe o botão/dados de pagamento
  const isAwaitingPayment = order.status === "AGUARDANDO_PAGAMENTO";
  let paymentUrl: string | null = order.paymentUrl;
  let pixQrCode: string | null = order.pixQrCode;
  let pixQrCodeBase64: string | null = order.pixQrCodeBase64;

  if (isAwaitingPayment && (!paymentUrl && !pixQrCode)) {
    try {
      const { getPaymentGateway } = await import("@/lib/payments/gateway-registry");
      const gatewayName = order.paymentGateway || "MERCADOPAGO";
      const gateway = getPaymentGateway(gatewayName);
      
      const orderWithDetails = {
        ...order,
        items: order.items.map((it) => ({
          ...it,
          product: it.product,
        })),
        shippingAddress: order.shippingAddress,
      };

      const res = await gateway.createPayment(orderWithDetails as any);
      if (res.success) {
        paymentUrl = res.paymentUrl || null;
        pixQrCode = res.pixQrCode || null;
        pixQrCodeBase64 = res.pixQrCodeBase64 || null;

        // Persiste no banco de dados para acessos futuros
        await db.order.update({
          where: { id: order.id },
          data: {
            paymentUrl: res.paymentUrl || null,
            pixQrCode: res.pixQrCode || null,
            pixQrCodeBase64: res.pixQrCodeBase64 || null,
          },
        });
      }
    } catch (err) {
      console.error("Erro ao gerar dados de pagamento na página do pedido:", err);
    }
  }

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

          {/* Métodos de Pagamento */}
          {isAwaitingPayment && !isPaid && (
            <div className="mt-8 border-t border-gold/15 pt-8">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-6">Como deseja realizar o pagamento?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-2xl mx-auto text-left">
                {/* Opção 1: PIX */}
                {pixQrCode && pixQrCodeBase64 && (
                  <div className="bg-cream-warm/30 rounded-3xl border border-gold/20 p-6 flex flex-col justify-between items-center text-center">
                    <div>
                      <span className="bg-forest/10 text-forest px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                        Recomendado
                      </span>
                      <h4 className="font-serif text-lg text-primary mt-3 font-semibold font-sans">Pagar com Pix</h4>
                      <p className="text-xs text-dark/65 mt-1 leading-relaxed">
                        Aprovação instantânea! A produção do livro começa imediatamente.
                      </p>
                    </div>
                    
                    {/* QR Code */}
                    <div className="my-5 bg-white p-3 rounded-2xl border border-gold/15 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:image/png;base64,${pixQrCodeBase64}`}
                        alt="QR Code Pix"
                        className="w-40 h-40 object-contain"
                      />
                    </div>
                    
                    <p className="text-[11px] text-dark/50 px-2 leading-relaxed">
                      Escaneie o código acima com o app do seu banco ou copie a chave abaixo:
                    </p>
                    
                    <PixCopyButton code={pixQrCode} />
                  </div>
                )}
                
                {/* Opção 2: Outros Meios (Cartão/Boleto) */}
                {paymentUrl && (
                  <div className="bg-cream-warm/30 rounded-3xl border border-gold/20 p-6 flex flex-col justify-between items-center text-center">
                    <div>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                        Outras opções
                      </span>
                      <h4 className="font-serif text-lg text-primary mt-3 font-semibold font-sans">Cartão ou Boleto</h4>
                      <p className="text-xs text-dark/65 mt-1 leading-relaxed">
                        Parcele em até 12x no cartão ou pague via boleto bancário pelo Mercado Pago.
                      </p>
                    </div>

                    <div className="my-8 flex flex-col items-center justify-center w-full">
                      {/* Bandeiras de cartões */}
                      <div className="flex flex-wrap justify-center gap-2 max-w-[200px] opacity-85">
                        <span className="bg-white border border-dark/5 rounded px-1.5 py-1 text-[9px] font-bold text-dark/60 shadow-sm">VISA</span>
                        <span className="bg-white border border-dark/5 rounded px-1.5 py-1 text-[9px] font-bold text-dark/60 shadow-sm">MASTERCARD</span>
                        <span className="bg-white border border-dark/5 rounded px-1.5 py-1 text-[9px] font-bold text-dark/60 shadow-sm">ELO</span>
                        <span className="bg-white border border-dark/5 rounded px-1.5 py-1 text-[9px] font-bold text-dark/60 shadow-sm">AMEX</span>
                        <span className="bg-white border border-dark/5 rounded px-1.5 py-1 text-[9px] font-bold text-dark/60 shadow-sm">BOLETO</span>
                      </div>
                    </div>

                    <a
                      href={paymentUrl}
                      className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs w-full mt-auto shadow-md"
                    >
                      <span>
                        {order.paymentGateway === "SIMULADO"
                          ? "Ir para o Simulador"
                          : "Pagar com Cartão / Boleto"}
                      </span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-xs text-dark/50 border-t border-gold/10 pt-4">
                <span className="flex items-center gap-1">
                  {order.paymentGateway === "SIMULADO" ? "⚙️ Modo de Testes" : "🔒 Transação 100% Segura"}
                </span>
                <span>⚡ Confirmação em Tempo Real</span>
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
