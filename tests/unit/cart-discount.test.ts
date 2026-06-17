import { describe, expect, it } from "vitest";
import { applyComboDiscount } from "@/lib/cart/discount";
import type { CartItem } from "@/lib/cart/types";

function item(
  id: string,
  type: CartItem["type"],
  price: number,
  quantity = 1,
): CartItem {
  return { id, slug: id, name: id, type, price, quantity };
}

describe("applyComboDiscount", () => {
  it("empty cart → all zeros", () => {
    const t = applyComboDiscount([]);
    expect(t.subtotal).toBe(0);
    expect(t.discount).toBe(0);
    expect(t.total).toBe(0);
  });

  it("only main book → no discount", () => {
    const t = applyComboDiscount([item("b", "LIVRO_PRINCIPAL", 189.9)]);
    expect(t.subtotal).toBe(189.9);
    expect(t.discount).toBe(0);
    expect(t.total).toBe(189.9);
  });

  it("only addon (no main book) → no discount", () => {
    const t = applyComboDiscount([item("c", "LIVRO_COLORIR", 49.9)]);
    expect(t.discount).toBe(0);
    expect(t.total).toBe(49.9);
  });

  it("main book + 1 addon → R$ 15 off", () => {
    const t = applyComboDiscount([
      item("b", "LIVRO_PRINCIPAL", 189.9),
      item("c", "LIVRO_COLORIR", 49.9),
    ]);
    expect(t.subtotal).toBe(239.8);
    expect(t.discount).toBe(15);
    expect(t.total).toBe(224.8);
    expect(t.discountedUnits).toBe(1);
  });

  it("main book + 4 addons → R$ 60 off", () => {
    const t = applyComboDiscount([
      item("b", "LIVRO_PRINCIPAL", 189.9),
      item("e", "EBOOK", 39.9),
      item("c", "LIVRO_COLORIR", 49.9),
      item("q", "QUEBRA_CABECA", 69.9),
      item("a", "CARTELA_ADESIVOS", 29.9),
    ]);
    expect(t.subtotal).toBe(379.5);
    expect(t.discount).toBe(60);
    expect(t.total).toBe(319.5);
    expect(t.discountedUnits).toBe(4);
  });

  it("main book + 2x same addon (qty=2) → R$ 30 off", () => {
    const t = applyComboDiscount([
      item("b", "LIVRO_PRINCIPAL", 189.9),
      item("c", "LIVRO_COLORIR", 49.9, 2),
    ]);
    expect(t.discount).toBe(30);
    expect(t.discountedUnits).toBe(2);
  });

  it("multiple main books → still discounts all addons", () => {
    const t = applyComboDiscount([
      item("b", "LIVRO_PRINCIPAL", 189.9, 2),
      item("c", "LIVRO_COLORIR", 49.9),
    ]);
    expect(t.discount).toBe(15);
    expect(t.mainBookQuantity).toBe(2);
  });

  it("discount never exceeds subtotal", () => {
    // edge: adicional barato, 10 unidades, 1 livro principal
    const t = applyComboDiscount([
      item("b", "LIVRO_PRINCIPAL", 189.9),
      item("a", "CARTELA_ADESIVOS", 5, 10),
    ]);
    // raw discount = 10 * 15 = 150, subtotal = 189.9 + 50 = 239.9
    // total nunca < 0
    expect(t.total).toBeGreaterThanOrEqual(0);
  });

  it("rounds to 2 decimal places", () => {
    const t = applyComboDiscount([
      item("b", "LIVRO_PRINCIPAL", 189.999),
      item("c", "LIVRO_COLORIR", 49.999),
    ]);
    expect(Number.isInteger(t.subtotal * 100)).toBe(true);
    expect(Number.isInteger(t.total * 100)).toBe(true);
  });
});
