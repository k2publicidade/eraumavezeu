import { db } from "@/lib/db";
import type { ProductType } from "@/lib/cart/types";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  priceOld: number | null;
  type: ProductType;
  images: string[];
};

export const FALLBACK_PRODUCTS: CatalogProduct[] = [
  {
    id: "fallback-livro-principal-capa-dura",
    slug: "livro-principal-capa-dura",
    name: "Livro Capa Dura",
    description:
      "Livro infantil personalizado em capa dura, 20 páginas com ilustrações únicas geradas por IA. O herói da história é a criança que você ama. Cada livro tem um design e roteiro único, nenhum exemplar é igual ao outro. Inclui também a sua dedicatória personalizada. Tamanho 21x30 cm.",
    price: 249.9,
    priceOld: 299.9,
    type: "LIVRO_PRINCIPAL",
    images: [],
  },
  {
    id: "fallback-ebook",
    slug: "ebook",
    name: "E-book",
    description:
      "Versão digital do livro personalizado em PDF de alta qualidade, enviado por e-mail. Na compra do livro capa dura, o e-book está incluso de presente!",
    price: 79.9,
    priceOld: null,
    type: "EBOOK",
    images: [],
  },
  {
    id: "fallback-livro-colorir",
    slug: "livro-colorir",
    name: "Livro de Colorir",
    description:
      "Imagine a alegria da criança ao poder colorir a própria imagem. São 20 páginas repletas de cenas da aventura escolhida, onde ela é a verdadeira protagonista. Você define o estilo da arte e nós entregamos um livro no tamanho perfeito (22x15cm) para levar a criatividade a qualquer lugar!",
    price: 99.9,
    priceOld: null,
    type: "LIVRO_COLORIR",
    images: [],
  },
  {
    id: "fallback-quebra-cabeca",
    slug: "quebra-cabeca",
    name: "Quebra-Cabeça",
    description:
      "Monte essa magia junto com a criança! Transforme uma imagem personalizada do seu filho — ou uma foto especial escolhida por você — em um quebra-cabeça de 60 peças (21x29 cm). A alegria de ver o próprio rosto se formando a cada encaixe!",
    price: 79.9,
    priceOld: null,
    type: "QUEBRA_CABECA",
    images: [],
  },
  {
    id: "fallback-cartela-adesivos",
    slug: "cartela-adesivos",
    name: "Cartela de Adesivos",
    description:
      "Uma super cartela (28x40 cm) repleta de ilustrações personalizadas do protagonista e elementos do tema. Perfeita para a criança soltar a imaginação e personalizar o que quiser!",
    price: 69.9,
    priceOld: null,
    type: "CARTELA_ADESIVOS",
    images: [],
  },
];

type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: { toString(): string } | number;
  priceOld: { toString(): string } | number | null;
  type: string;
  images: string[];
};
export function resolveCatalogProducts(products: ProductRecord[]): CatalogProduct[] {
  if (products.length === 0) return FALLBACK_PRODUCTS;

  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    priceOld: product.priceOld ? Number(product.priceOld) : null,
    type: product.type as ProductType,
    images: product.images || [],
  }));
}

export async function getActiveProducts(): Promise<CatalogProduct[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return FALLBACK_PRODUCTS;
  }

  try {
    const products = await db.product.findMany({
      where: { active: true },
      orderBy: { price: "desc" },
    });

    return resolveCatalogProducts(products);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[products:fallback] usando catálogo estático", error);
    }
    return FALLBACK_PRODUCTS;
  }
}

export async function getAddonProducts(): Promise<CatalogProduct[]> {
  const products = await getActiveProducts();
  return products.filter((product) => product.type !== "LIVRO_PRINCIPAL");
}
