import type { Metadata } from "next";
import GalleryFilter from "@/components/site/GalleryFilter";
import { GALLERY_SAMPLES, GALLERY_THEMES } from "@/lib/gallery-data";

export const metadata: Metadata = {
  title: "Galeria",
  description:
    "Inspire-se em histórias reais de famílias que já criaram seus livros personalizados com ilustrações únicas.",
};

export default function GaleriaPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-to-b from-light to-primary/5">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-dark">
            Galeria
          </h1>
          <p className="mt-4 text-lg text-dark/70">
            Veja o &ldquo;Antes&rdquo; e o &ldquo;Depois&rdquo;, separados por
            tema: a foto real da criança e a ilustração pronta.
          </p>
          <p className="mt-3 text-base text-dark/60">
            Veja como nossas ilustrações capturam os traços, o sorriso e a
            essência de cada pequeno protagonista.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <GalleryFilter
            themes={[...GALLERY_THEMES]}
            samples={[...GALLERY_SAMPLES]}
          />
        </div>
      </section>
    </>
  );
}
