"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WHATSAPP_MESSAGE_DEFAULT, WHATSAPP_NUMBER } from "@/lib/site-config";
import { useCartStore } from "@/lib/cart/store";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export default function CheckoutView() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const getTotals = useCartStore((s) => s.getTotals);
  const totals = hydrated ? getTotals() : { subtotal: 0, discount: 0, total: 0, discountedUnits: 0 };

  const whatsappHref = useMemo(() => {
    const lines = [
      WHATSAPP_MESSAGE_DEFAULT,
      "",
      "Resumo do carrinho:",
      ...items.map((item) => `- ${item.quantity}x ${item.name}: ${formatBRL(item.price * item.quantity)}`),
      totals.discount > 0 ? `Desconto combo: -${formatBRL(totals.discount)}` : null,
      `Total: ${formatBRL(totals.total)}`,
    ].filter(Boolean);

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [items, totals.discount, totals.total]);

  if (!hydrated) {
    return <div className="text-center py-20 text-dark/60">Carregando checkout…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="card-premium p-10 text-center max-w-xl mx-auto">
        <h1 className="font-serif text-3xl text-primary">Carrinho vazio</h1>
        <p className="mt-3 text-dark/65">Personalize um livro antes de finalizar.</p>
        <Link href="/personalizar" className="btn-primary-lg mt-6 inline-flex">
          Criar meu livro
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
      <section className="card-premium p-6 md:p-8">
        <p className="badge-gold">Checkout assistido</p>
        <h1 className="mt-4 font-serif text-3xl md:text-4xl text-primary">
          Dados para finalizar o pedido
        </h1>
        <p className="mt-3 text-dark/70 leading-relaxed">
          Para a apresentação, este checkout já mostra o fluxo final: dados do comprador,
          endereço, escolha de pagamento e fechamento assistido pelo WhatsApp. A integração
          automática com Mercado Pago e Melhor Envio entra na próxima entrega técnica.
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-primary">Nome completo</span>
            <input className="input-field mt-1" placeholder="Ex.: Mariana Souza" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-primary">E-mail</span>
            <input className="input-field mt-1" type="email" placeholder="voce@email.com" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-primary">WhatsApp</span>
            <input className="input-field mt-1" inputMode="tel" placeholder="(11) 99999-9999" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-primary">CEP</span>
            <input className="input-field mt-1" inputMode="numeric" placeholder="00000-000" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-primary">Endereço de entrega</span>
            <input className="input-field mt-1" placeholder="Rua, número, complemento, bairro, cidade/UF" />
          </label>
        </div>

        <div className="mt-8 rounded-2xl border border-gold/30 bg-cream p-5">
          <h2 className="font-serif text-xl text-primary">Pagamento</h2>
          <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
            {['PIX', 'Cartão', 'Boleto'].map((method) => (
              <div key={method} className="rounded-xl border border-gold/25 bg-cream-light px-4 py-3 text-primary font-medium">
                {method}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-dark/60">
            Mercado Pago: PIX/cartão/boleto preparado no escopo; webhook e preferência ficam como pendência técnica.
          </p>
        </div>
      </section>

      <aside className="card-premium p-6 h-fit sticky top-24">
        <h2 className="font-serif text-2xl text-primary">Resumo do pedido</h2>
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 justify-between border-b border-gold/20 pb-3">
              <div>
                <p className="font-medium text-primary">{item.name}</p>
                <p className="text-xs text-dark/60">Qtd. {item.quantity}</p>
              </div>
              <p className="font-semibold text-dark">{formatBRL(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-dark/65">Subtotal</dt>
            <dd>{formatBRL(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-forest">
              <dt>Desconto combo</dt>
              <dd>- {formatBRL(totals.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-gold/25 pt-3 text-lg">
            <dt className="font-semibold text-primary">Total</dt>
            <dd className="font-serif text-fox font-bold">{formatBRL(totals.total)}</dd>
          </div>
        </dl>

        <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-primary mt-6 w-full justify-center">
          Finalizar pelo WhatsApp →
        </a>
        <Link href="/carrinho" className="mt-3 block text-center text-sm text-dark/60 hover:text-primary">
          Voltar ao carrinho
        </Link>
      </aside>
    </div>
  );
}
