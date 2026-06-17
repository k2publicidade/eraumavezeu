import { describe, expect, it } from "vitest";
import {
  buildOrderDraft,
  orderCodeOf,
  type DbProduct,
} from "@/lib/orders/build-order";
import { COMBO_DISCOUNT } from "@/lib/cart/types";

const CATALOG: DbProduct[] = [
  {
    id: "p-livro",
    slug: "livro-principal-capa-dura",
    name: "Livro Principal Capa Dura",
    type: "LIVRO_PRINCIPAL",
    price: 249.9,
  },
  {
    id: "p-qc",
    slug: "quebra-cabeca",
    name: "Quebra-Cabeça",
    type: "QUEBRA_CABECA",
    price: 79.9,
  },
  {
    id: "p-adesivos",
    slug: "cartela-adesivos",
    name: "Cartela de Adesivos",
    type: "CARTELA_ADESIVOS",
    price: 69.9,
  },
];

describe("buildOrderDraft", () => {
  it("usa o preço do BANCO, ignorando qualquer valor do client", () => {
    const draft = buildOrderDraft(
      [{ slug: "livro-principal-capa-dura", quantity: 1 }],
      CATALOG,
    );
    expect(draft.items).toEqual([
      { productId: "p-livro", quantity: 1, price: 249.9, discount: 0 },
    ]);
    expect(draft.totals.total).toBe(249.9);
  });

  it("aplica R$ 15 de desconto por unidade de adicional quando há livro principal", () => {
    const draft = buildOrderDraft(
      [
        { slug: "livro-principal-capa-dura", quantity: 1 },
        { slug: "quebra-cabeca", quantity: 2 },
      ],
      CATALOG,
    );
    const qc = draft.items.find((i) => i.productId === "p-qc");
    expect(qc?.discount).toBe(COMBO_DISCOUNT * 2);
    expect(draft.totals.discount).toBe(COMBO_DISCOUNT * 2);
    expect(draft.totals.total).toBeCloseTo(249.9 + 79.9 * 2 - COMBO_DISCOUNT * 2, 2);
  });

  it("NÃO desconta adicionais sem livro principal no pedido", () => {
    const draft = buildOrderDraft(
      [{ slug: "cartela-adesivos", quantity: 1 }],
      CATALOG,
    );
    expect(draft.items[0]?.discount).toBe(0);
    expect(draft.totals.discount).toBe(0);
    expect(draft.totals.total).toBe(69.9);
  });

  it("soma do draft bate com os totals (display e cobrança nunca divergem)", () => {
    const draft = buildOrderDraft(
      [
        { slug: "livro-principal-capa-dura", quantity: 1 },
        { slug: "quebra-cabeca", quantity: 1 },
        { slug: "cartela-adesivos", quantity: 1 },
      ],
      CATALOG,
    );
    const itemsTotal = draft.items.reduce(
      (acc, it) => acc + it.price * it.quantity - it.discount,
      0,
    );
    expect(itemsTotal).toBeCloseTo(draft.totals.total, 2);
  });

  it("lança erro quando o slug não existe no catálogo ativo", () => {
    expect(() =>
      buildOrderDraft([{ slug: "produto-removido", quantity: 1 }], CATALOG),
    ).toThrow(/produto-removido/);
  });
});

describe("orderCodeOf", () => {
  it("extrai os últimos 8 caracteres do cuid em caixa alta", () => {
    expect(orderCodeOf("clxyz1234abcd5678efgh")).toBe("5678EFGH");
  });
});
