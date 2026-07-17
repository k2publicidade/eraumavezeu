import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/site/Header";
import WhatsAppFloatingButton from "@/components/site/WhatsAppFloatingButton";
import SkipLink from "@/components/site/SkipLink";
import WizardRedirect from "@/components/wizard/WizardRedirect";
import { getActiveProducts, FALLBACK_PRODUCTS } from "@/lib/products";

export const metadata: Metadata = {
  title: "Criar meu livro",
  description:
    "Adicione o livro ao carrinho e personalize seus detalhes no checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PersonalizarPage() {
  const products = await getActiveProducts();
  const mainProduct = products.find((p) => p.type === "LIVRO_PRINCIPAL") || FALLBACK_PRODUCTS[0];

  return (
    <>
      <SkipLink />
      <Header />
      <main id="conteudo-principal" tabIndex={-1} className="min-h-screen bg-light py-10 md:py-16 px-4">
        <div className="container mx-auto">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
              <p className="text-dark/70 font-medium">Carregando...</p>
            </div>
          }>
            <WizardRedirect product={{
              id: mainProduct.id,
              slug: mainProduct.slug,
              name: mainProduct.name,
              type: mainProduct.type,
              price: mainProduct.price,
            }} />
          </Suspense>
        </div>
      </main>
      <WhatsAppFloatingButton />
    </>
  );
}
