import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/site/Header";
import WhatsAppFloatingButton from "@/components/site/WhatsAppFloatingButton";

const Wizard = dynamic(() => import("@/components/wizard/Wizard"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Personalizar livro",
  description:
    "Monte em 7 passos o livro personalizado — tema, estilo, fotos da criança e dedicatória.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PersonalizarPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-light py-10 md:py-16 px-4">
        <div className="container mx-auto">
          <h1 className="font-serif text-3xl md:text-5xl text-center text-dark mb-2">
            Vamos criar o livro
          </h1>
          <p className="text-center text-dark/60 mb-10">
            7 passos simples. Você pode fechar e continuar depois de onde parou.
          </p>
          <Suspense fallback={<div className="text-center py-20 text-dark/60">Carregando wizard…</div>}>
            <Wizard />
          </Suspense>
        </div>
      </main>
      <WhatsAppFloatingButton />
    </>
  );
}

