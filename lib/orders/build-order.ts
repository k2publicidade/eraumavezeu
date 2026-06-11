import { applyComboDiscount, type Totals } from "@/lib/cart/discount";
import {
  ADDON_TYPES,
  COMBO_DISCOUNT,
  type CartItem,
  type ProductType,
} from "@/lib/cart/types";

export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  type: ProductType;
  /** preço em reais já convertido de Decimal */
  price: number;
};

export type OrderItemDraft = {
  productId: string;
  quantity: number;
  price: number;
  discount: number;
};

export type OrderDraft = {
  items: OrderItemDraft[];
  totals: Totals;
};

/** Código curto exibido ao cliente — o cuid completo fica só na URL. */
export function orderCodeOf(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

/**
 * Autoridade server-side de preço: ignora qualquer valor vindo do client e
 * monta os OrderItems a partir dos produtos do BANCO, reusando a mesma
 * applyComboDiscount do carrinho — display e cobrança nunca divergem.
 *
 * Lança Error se algum slug não existir no catálogo ativo.
 */
export function buildOrderDraft(
  requested: ReadonlyArray<{ slug: string; quantity: number }>,
  products: ReadonlyArray<DbProduct>,
): OrderDraft {
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const cartItems: CartItem[] = requested.map((r) => {
    const product = bySlug.get(r.slug);
    if (!product) throw new Error(`Produto indisponível: ${r.slug}`);
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      type: product.type,
      price: product.price,
      quantity: r.quantity,
    };
  });

  const totals = applyComboDiscount(cartItems);
  const hasMainBook = totals.mainBookQuantity > 0;

  const items: OrderItemDraft[] = cartItems.map((it) => ({
    productId: it.id,
    quantity: it.quantity,
    price: it.price,
    discount:
      hasMainBook && ADDON_TYPES.includes(it.type)
        ? COMBO_DISCOUNT * it.quantity
        : 0,
  }));

  return { items, totals };
}
