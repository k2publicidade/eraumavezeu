"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart/store";
import type { CartProduct } from "@/lib/cart/types";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

type Props = {
  crossSellProducts: CartProduct[];
};

export default function CartView({ crossSellProducts }: Props) {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotals = useCartStore((s) => s.getTotals);
  const addItem = useCartStore((s) => s.addItem);
  const [cep, setCep] = useState("");
  const [shippingHint, setShippingHint] = useState<string | null>(null);

  if (!hydrated) {
    return <div className="text-center py-20 text-dark/60">Carregando…</div>;
  }

  const totals = getTotals();
  const hasMainBook = items.some((i) => i.type === "LIVRO_PRINCIPAL");
  const crossSellCandidates = crossSellProducts.filter(
    (p) => !items.some((i) => i.id === p.id),
  );

  if (items.length === 0) {
    return (
      <div className="bg-cream-light rounded-2xl p-10 text-center border border-gold/25 shadow-sm">
        <h2 className="font-serif text-2xl text-primary">Seu carrinho está vazio</h2>
        <p className="mt-2 text-dark/55">
          Comece personalizando o livro principal.
        </p>
        <Link
          href="/personalizar"
          className="btn-primary-lg mt-6 inline-flex"
        >
          Criar meu livro
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="bg-cream-light rounded-2xl p-5 border border-gold/25 flex flex-col sm:flex-row sm:items-center gap-4 shadow-xs"
          >
            <div className="flex-1">
              <h3 className="font-serif text-lg text-primary">{item.name}</h3>
              <p className="text-sm text-dark/55">{formatBRL(item.price)} cada</p>
            </div>
            <div className="flex items-center border border-gold/30 rounded-full overflow-hidden bg-cream self-start sm:self-auto">
              <button
                type="button"
                aria-label={`Diminuir quantidade de ${item.name}`}
                className="w-9 h-9 hover:bg-gold/20 transition-colors duration-150 text-primary font-medium"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium text-primary">{item.quantity}</span>
              <button
                type="button"
                aria-label={`Aumentar quantidade de ${item.name}`}
                className="w-9 h-9 hover:bg-gold/20 transition-colors duration-150 text-primary font-medium"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="w-full sm:w-24 sm:text-right font-semibold text-primary">
              {formatBRL(item.price * item.quantity)}
            </div>
            <button
              type="button"
              aria-label={`Remover ${item.name}`}
              onClick={() => removeItem(item.id)}
              className="text-dark/35 hover:text-fox-dark transition-colors duration-150 text-xl leading-none px-2"
            >
              ×
            </button>
          </article>
        ))}

        {hasMainBook && crossSellCandidates.length > 0 && (
          <div className="bg-gold/10 border border-gold/35 rounded-2xl p-6">
            <h3 className="font-serif text-lg text-primary">
              Economize R$ 20 adicionando
            </h3>
            <p className="text-sm text-dark/55 mt-1 mb-4">
              Cada adicional entra com desconto combo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {crossSellCandidates.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addItem(p)}
                  className="text-left bg-cream-light rounded-xl p-4 border border-gold/25 hover:border-gold/60 hover:shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                >
                  <div className="text-sm text-dark/60">{p.name}</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-dark/35 line-through text-xs">
                      {formatBRL(p.price)}
                    </span>
                    <span className="text-fox font-semibold">
                      {formatBRL(Math.max(p.price - 20, 0))}
                    </span>
                  </div>
                  <span className="mt-2 inline-block text-xs text-primary font-medium">
                    + Adicionar
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <aside className="bg-cream-light rounded-2xl p-6 border border-gold/25 shadow-sm h-fit sticky top-24">
        <h3 className="font-serif text-xl text-primary">Resumo</h3>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-dark/60">Subtotal</dt>
            <dd className="text-dark">{formatBRL(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-forest">
              <dt>Desconto combo ({totals.discountedUnits}x)</dt>
              <dd>− {formatBRL(totals.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-gold/25 pt-3 mt-3 text-lg">
            <dt className="font-semibold text-primary">Total</dt>
            <dd className="font-serif text-fox font-bold">
              {formatBRL(totals.total)}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <label htmlFor="cep" className="text-sm text-dark/60 font-medium">
            Calcular frete
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="cep"
              type="text"
              inputMode="numeric"
              placeholder="00000-000"
              value={cep}
              onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="flex-1 px-3 py-2 rounded-lg border-2 border-gold/25 bg-cream focus:border-primary focus:outline-none text-sm"
            />
            <button
              type="button"
              onClick={() =>
                setShippingHint(
                  cep.length === 8
                    ? "Frete exato disponível no checkout."
                    : "Digite um CEP válido (8 dígitos).",
                )
              }
              className="px-4 py-2 rounded-lg border-2 border-gold/30 text-sm text-primary hover:border-primary hover:bg-gold/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              OK
            </button>
          </div>
          {shippingHint && (
            <p className="mt-2 text-xs text-dark/55">{shippingHint}</p>
          )}
        </div>

        <Link
          href="/checkout"
          className="btn-primary mt-6 w-full justify-center"
        >
          Ir para o checkout →
        </Link>
        <Link
          href="/produtos"
          className="mt-3 block text-center text-sm text-dark/55 hover:text-primary transition-colors duration-200"
        >
          Continuar comprando
        </Link>
      </aside>
    </div>
  );
}
