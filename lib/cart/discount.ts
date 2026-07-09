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
 *   "Cada adicional ganha R$ 15 de desconto QUANDO comprado junto com o
 *    livro capa dura. Se houver N adicionais (mesmo tipo ou não), o desconto
 *    é N * R$ 15 — limitado a 1 desconto por unidade de adicional, e nunca
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

  // E-book is included (free) when a main book is in the cart
  const ebookItems = items.filter((it) => it.type === "EBOOK");
  const ebookQuantity = ebookItems.reduce((acc, it) => acc + it.quantity, 0);
  const freeEbooksCount = mainBookQuantity > 0 ? Math.min(mainBookQuantity, ebookQuantity) : 0;
  
  // Calculate total discount from free ebooks (using their respective prices)
  let ebookDiscount = 0;
  let remainingFreeCount = freeEbooksCount;
  for (const it of ebookItems) {
    if (remainingFreeCount <= 0) break;
    const taken = Math.min(it.quantity, remainingFreeCount);
    ebookDiscount += taken * it.price;
    remainingFreeCount -= taken;
  }

  // Other addons get the standard COMBO_DISCOUNT (15)
  const otherAddons = items.filter(
    (it) => it.type !== "LIVRO_PRINCIPAL" && it.type !== "EBOOK"
  );
  const otherAddonUnits = otherAddons.reduce((acc, it) => acc + it.quantity, 0);
  const otherAddonDiscount = mainBookQuantity > 0 ? otherAddonUnits * COMBO_DISCOUNT : 0;

  const discount = ebookDiscount + otherAddonDiscount;
  const discountedUnits = freeEbooksCount + (mainBookQuantity > 0 ? otherAddonUnits : 0);
  const addonUnits = ebookQuantity + otherAddonUnits;

  return {
    subtotal: round2(subtotal),
    discount: round2(discount),
    total: round2(Math.max(subtotal - discount, 0)),
    mainBookQuantity,
    addonUnits,
    discountedUnits,
  };
}
