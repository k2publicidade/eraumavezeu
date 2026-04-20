import {
  ADDON_TYPES,
  COMBO_DISCOUNT,
  type CartItem,
  type ProductType,
} from "./types";

export type Totals = {
  subtotal: number;
  discount: number;
  total: number;
  mainBookQuantity: number;
  addonUnits: number;
  discountedUnits: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function isAddon(type: ProductType): boolean {
  return ADDON_TYPES.includes(type);
}

/**
 * Autoridade única para cálculo do carrinho. IMPORTADA tanto pelo store
 * (display client-side) quanto pelo createOrder (server-side), garantindo
 * que o preço nunca diverge entre UI e banco.
 *
 * Regra do cliente (brief):
 *   "Cada adicional ganha R$ 20 de desconto QUANDO comprado junto com o
 *    livro principal. Se houver N adicionais (mesmo tipo ou não), o desconto
 *    é N * R$ 20 — limitado a 1 desconto por unidade de adicional, e nunca
 *    excedendo o número de livros principais * X adicionais (combos
 *    proporcionais)."
 *
 * Implementação MVP: o desconto rola por unidade de adicional se HOUVER pelo
 * menos 1 livro principal. Sem limite de adicionais por livro principal.
 * Isso favorece o cliente e reflete o texto do brief direto.
 */
export function applyComboDiscount(items: CartItem[]): Totals {
  const subtotal = items.reduce(
    (acc, it) => acc + it.price * it.quantity,
    0,
  );

  const mainBookQuantity = items
    .filter((it) => it.type === "LIVRO_PRINCIPAL")
    .reduce((acc, it) => acc + it.quantity, 0);

  const addonUnits = items
    .filter((it) => isAddon(it.type))
    .reduce((acc, it) => acc + it.quantity, 0);

  const discountedUnits = mainBookQuantity > 0 ? addonUnits : 0;
  const discount = discountedUnits * COMBO_DISCOUNT;

  return {
    subtotal: round2(subtotal),
    discount: round2(discount),
    total: round2(Math.max(subtotal - discount, 0)),
    mainBookQuantity,
    addonUnits,
    discountedUnits,
  };
}
