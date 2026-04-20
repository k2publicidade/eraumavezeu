import type { Metadata } from "next";
import { db } from "@/lib/db";
import CartView from "@/components/cart/CartView";
import type { CartProduct, ProductType } from "@/lib/cart/types";

export const metadata: Metadata = {
  title: "Carrinho",
  description:
    "Revise seu carrinho, veja o desconto combo aplicado e siga para o checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 300;

export default async function CarrinhoPage() {
  const addons = await db.product.findMany({
    where: {
      active: true,
      type: {
        in: ["EBOOK", "LIVRO_COLORIR", "QUEBRA_CABECA", "CARTELA_ADESIVOS"],
      },
    },
  });

  const crossSellProducts: CartProduct[] = addons.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    type: p.type as ProductType,
    price: Number(p.price),
  }));

  return (
    <section className="py-10 md:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="font-serif text-3xl md:text-4xl text-dark mb-8">
          Seu carrinho
        </h1>
        <CartView crossSellProducts={crossSellProducts} />
      </div>
    </section>
  );
}
