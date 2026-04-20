import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PRIMARY_CTA } from "@/lib/site-config";
import AddToCartButton from "@/components/cart/AddToCartButton";
import type { ProductType } from "@/lib/cart/types";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Livro principal capa dura, e-book, livro de colorir, quebra-cabeça e adesivos. Combo com R$ 20 de desconto por adicional.",
};

export const revalidate = 300;

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const PRODUCT_TYPE_EMOJI: Record<string, string> = {
  LIVRO_PRINCIPAL: "📕",
  EBOOK: "💻",
  LIVRO_COLORIR: "🖍️",
  QUEBRA_CABECA: "🧩",
  CARTELA_ADESIVOS: "✨",
};

export default async function ProdutosPage() {
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { price: "desc" },
  });

  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-to-b from-light to-primary/5">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-dark">
            Nossos produtos
          </h1>
          <p className="mt-4 text-lg text-dark/70">
            Monte o combo perfeito. Adicionais ganham{" "}
            <strong className="text-primary">R$ 20 de desconto</strong> quando
            comprados junto do livro principal.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-8 border border-primary/10 shadow-sm flex flex-col"
              >
                <div className="text-6xl" aria-hidden>
                  {PRODUCT_TYPE_EMOJI[p.type] ?? "🎁"}
                </div>
                <h2 className="mt-4 font-serif text-2xl text-dark">{p.name}</h2>
                <p className="mt-2 text-dark/70 text-sm flex-1">
                  {p.description}
                </p>
                <div className="mt-4 flex items-baseline gap-3">
                  {p.priceOld && (
                    <span className="text-dark/40 line-through text-sm">
                      {formatBRL(Number(p.priceOld))}
                    </span>
                  )}
                  <span className="text-primary font-serif text-2xl">
                    {formatBRL(Number(p.price))}
                  </span>
                </div>

                <div className="mt-6">
                  {p.type === "LIVRO_PRINCIPAL" ? (
                    <Link
                      href="/personalizar"
                      className="inline-block bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary-dark transition text-sm font-medium"
                    >
                      Personalizar este livro →
                    </Link>
                  ) : (
                    <AddToCartButton
                      product={{
                        id: p.id,
                        slug: p.slug,
                        name: p.name,
                        type: p.type as ProductType,
                        price: Number(p.price),
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href={PRIMARY_CTA.href}
              className="inline-block bg-primary text-white px-8 py-4 rounded-full hover:bg-primary-dark transition text-lg font-medium shadow-lg"
            >
              {PRIMARY_CTA.label}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
