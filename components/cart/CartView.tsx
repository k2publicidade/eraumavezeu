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
      <div className="bg-white rounded-2xl p-10 text-center border border-primary/10">
        <h2 className="font-serif text-2xl text-dark">Seu carrinho está vazio</h2>
        <p className="mt-2 text-dark/60">
          Comece personalizando o livro principal.
        </p>
        <Link
          href="/personalizar"
          className="inline-block mt-6 bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-dark transition font-medium"
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
            className="bg-white rounded-2xl p-5 border border-primary/10 flex items-center gap-4"
          >
            <div className="flex-1">
              <h3 className="font-serif text-lg text-dark">{item.name}</h3>
              <p className="text-sm text-dark/60">{formatBRL(item.price)} cada</p>
            </div>
            <div className="flex items-center border border-primary/20 rounded-full overflow-hidden">
              <button
                type="button"
                aria-label="Diminuir"
                className="w-9 h-9 hover:bg-primary/10"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                −
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                type="button"
                aria-label="Aumentar"
                className="w-9 h-9 hover:bg-primary/10"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="w-24 text-right font-medium text-dark">
              {formatBRL(item.price * item.quantity)}
            </div>
            <button
              type="button"
              aria-label={`Remover ${item.name}`}
              onClick={() => removeItem(item.id)}
              className="text-dark/40 hover:text-red-600 transition text-xl leading-none px-2"
            >
              ×
            </button>
          </article>
        ))}

        {hasMainBook && crossSellCandidates.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
            <h3 className="font-serif text-lg text-dark">
              💡 Economize R$ 20 adicionando
            </h3>
            <p className="text-sm text-dark/60 mt-1 mb-4">
              Cada adicional entra com desconto combo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {crossSellCandidates.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addItem(p)}
                  className="text-left bg-white rounded-xl p-4 border border-primary/10 hover:border-primary transition"
                >
                  <div className="text-sm text-dark/60">{p.name}</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-dark/40 line-through text-xs">
                      {formatBRL(p.price)}
                    </span>
                    <span className="text-primary font-medium">
                      {formatBRL(Math.max(p.price - 20, 0))}
                    </span>
                  </div>
                  <span className="mt-2 inline-block text-xs text-primary">
                    + Adicionar
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <aside className="bg-white rounded-2xl p-6 border border-primary/10 h-fit sticky top-24">
        <h3 className="font-serif text-xl text-dark">Resumo</h3>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-dark/70">Subtotal</dt>
            <dd className="text-dark">{formatBRL(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-primary">
              <dt>Desconto combo ({totals.discountedUnits}x)</dt>
              <dd>− {formatBRL(totals.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-primary/10 pt-3 mt-3 text-lg">
            <dt className="font-medium text-dark">Total</dt>
            <dd className="font-serif text-primary">
              {formatBRL(totals.total)}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <label htmlFor="cep" className="text-sm text-dark/70">
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
              className="flex-1 px-3 py-2 rounded-lg border-2 border-primary/15 focus:border-primary focus:outline-none text-sm"
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
              className="px-4 py-2 rounded-lg border-2 border-primary/20 text-sm hover:border-primary"
            >
              OK
            </button>
          </div>
          {shippingHint && (
            <p className="mt-2 text-xs text-dark/60">{shippingHint}</p>
          )}
        </div>

        <Link
          href="/checkout"
          className="mt-6 block text-center bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition"
        >
          Ir para o checkout →
        </Link>
        <Link
          href="/produtos"
          className="mt-3 block text-center text-sm text-dark/70 hover:text-primary"
        >
          Continuar comprando
        </Link>
      </aside>
    </div>
  );
}
