import Link from "next/link";
import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/products";
import { PRIMARY_CTA } from "@/lib/site-config";
import AddToCartButton from "@/components/cart/AddToCartButton";

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
  const products = await getActiveProducts();

  return (
    <>
      <section className="py-16 md:py-24 bg-hero-warm">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-primary">
            Nossos produtos
          </h1>
          <p className="mt-4 text-lg text-dark/60">
            Monte o combo perfeito. Adicionais ganham{" "}
            <span className="text-fox font-semibold">R$ 20 de desconto</span>{" "}
            quando comprados junto do livro principal.
          </p>
        </div>
      </section>

      <section className="py-16 bg-cream-warm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {products.map((p) => (
              <div
                key={p.id}
                className="card-premium p-8 flex flex-col group"
              >
                <div
                  className="text-6xl group-hover:scale-110 transition-transform duration-250 inline-block"
                  aria-hidden
                >
                  {PRODUCT_TYPE_EMOJI[p.type] ?? "🎁"}
                </div>
                <h2 className="mt-4 font-serif text-2xl text-primary">{p.name}</h2>
                <p className="mt-2 text-dark/60 text-sm flex-1 leading-relaxed">
                  {p.description}
                </p>
                <div className="mt-5 flex items-baseline gap-3">
                  {p.priceOld && (
                    <span className="text-dark/35 line-through text-sm">
                      {formatBRL(p.priceOld)}
                    </span>
                  )}
                  <span className="text-fox font-serif text-2xl font-bold">
                    {formatBRL(p.price)}
                  </span>
                </div>

                <div className="mt-6">
                  {p.type === "LIVRO_PRINCIPAL" ? (
                    <Link
                      href="/personalizar"
                      className="btn-primary"
                    >
                      Personalizar este livro →
                    </Link>
                  ) : (
                    <AddToCartButton
                      product={{
                        id: p.id,
                        slug: p.slug,
                        name: p.name,
                        type: p.type,
                        price: p.price,
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href={PRIMARY_CTA.href} className="btn-primary-lg">
              {PRIMARY_CTA.label}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
