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
};

export const FALLBACK_PRODUCTS: CatalogProduct[] = [
  {
    id: "fallback-livro-principal-capa-dura",
    slug: "livro-principal-capa-dura",
    name: "Livro Principal Capa Dura",
    description:
      "Livro infantil personalizado em capa dura, 20 páginas com ilustrações únicas geradas por IA. O herói da história é a criança que você ama.",
    price: 249.9,
    priceOld: 299.9,
    type: "LIVRO_PRINCIPAL",
  },
  {
    id: "fallback-ebook",
    slug: "ebook",
    name: "E-book",
    description:
      "Versão digital do livro personalizado em PDF de alta qualidade, enviado por e-mail.",
    price: 89.9,
    priceOld: null,
    type: "EBOOK",
  },
  {
    id: "fallback-livro-colorir",
    slug: "livro-colorir",
    name: "Livro de Colorir",
    description:
      "Versão para colorir com as ilustrações do livro principal em preto e branco. Horas de diversão criativa.",
    price: 99.9,
    priceOld: null,
    type: "LIVRO_COLORIR",
  },
  {
    id: "fallback-quebra-cabeca",
    slug: "quebra-cabeca",
    name: "Quebra-Cabeça",
    description:
      "Quebra-cabeça personalizado com uma das ilustrações do livro. 48 peças em MDF premium.",
    price: 79.9,
    priceOld: null,
    type: "QUEBRA_CABECA",
  },
  {
    id: "fallback-cartela-adesivos",
    slug: "cartela-adesivos",
    name: "Cartela de Adesivos",
    description:
      "Cartela com adesivos dos personagens do livro para personalizar cadernos, fichários e mochilas.",
    price: 69.9,
    priceOld: null,
    type: "CARTELA_ADESIVOS",
  },
];

export async function getActiveProducts(): Promise<CatalogProduct[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return FALLBACK_PRODUCTS;
  }

  try {
    const products = await db.product.findMany({
      where: { active: true },
      orderBy: { price: "desc" },
    });

    return products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      priceOld: product.priceOld ? Number(product.priceOld) : null,
      type: product.type as ProductType,
    }));
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
