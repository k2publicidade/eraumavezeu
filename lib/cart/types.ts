export type ProductType =
  | "LIVRO_PRINCIPAL"
  | "EBOOK"
  | "LIVRO_COLORIR"
  | "QUEBRA_CABECA"
  | "CARTELA_ADESIVOS";

/**
 * Snapshot da personalização do wizard que viaja junto do item no carrinho.
 * Apenas fileKeys das fotos (nunca base64 — LGPD + quota de localStorage).
 * O servidor revalida tudo com Zod em createOrder.
 */
export type CustomizationSnapshot = {
  theme: string;
  genre: string;
  artStyle: string;
  favoriteColor: string;
  ageRange: string;
  childName: string;
  dedication: string;
  photoKeys: string[];
  consentAcceptedAt: string;
  consentTextVersion: string;
};

export type CartProduct = {
  id: string;
  slug: string;
  name: string;
  type: ProductType;
  /** preço em reais (centavos/100) */
  price: number;
  /** presente apenas no livro personalizado vindo do wizard */
  customization?: CustomizationSnapshot;
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
