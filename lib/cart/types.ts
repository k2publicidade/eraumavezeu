export type ProductType =
  | "LIVRO_PRINCIPAL"
  | "EBOOK"
  | "LIVRO_COLORIR"
  | "QUEBRA_CABECA"
  | "CARTELA_ADESIVOS";

export type CartProduct = {
  id: string;
  slug: string;
  name: string;
  type: ProductType;
  /** preço em reais (centavos/100) */
  price: number;
};

export type CartItem = CartProduct & {
  quantity: number;
};

export const ADDON_TYPES: ProductType[] = [
  "EBOOK",
  "LIVRO_COLORIR",
  "QUEBRA_CABECA",
  "CARTELA_ADESIVOS",
];

export const COMBO_DISCOUNT = 20;
