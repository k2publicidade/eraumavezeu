import Link from "next/link";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Quem Somos",
  description:
    "A história por trás do Era Uma Vez Eu: tecnologia, carinho e respeito por cada criança.",
};

export default async function QuemSomosPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-to-b from-light to-primary/5">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-dark">
            Quem somos
          </h1>
          <p className="mt-4 text-lg text-dark/70">
            Uma equipe de pais, ilustradores e desenvolvedores que acredita em
            livros que fazem a criança se ver no mundo.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-8 text-dark/80 leading-relaxed">
          <p>
            O <strong>Era Uma Vez Eu</strong> nasceu da vontade de juntar duas
            coisas que amamos: o poder das histórias e a tecnologia que permite
            criar imagens únicas em minutos. Mas ilustração gerada por
            computador sozinha não é o suficiente — por isso cada página passa
            por revisão humana da nossa equipe de arte.
          </p>

          <p>
            Acreditamos que toda criança merece um livro onde <em>ela</em> é a
            protagonista — com o rosto dela, o nome dela, as características que
            a fazem única. É um presente que gera memória afetiva pra vida
            inteira.
          </p>

          <h2 className="font-serif text-2xl text-dark pt-4">
            Nosso compromisso
          </h2>

          <ul className="space-y-3 list-disc list-inside">
            <li>
              <strong>Privacidade:</strong> fotos da criança ficam em bucket
              privado, com marca d&apos;água em qualquer preview público, e são
              excluídas 90 dias após a entrega.
            </li>
            <li>
              <strong>Consentimento:</strong> todo upload exige aceite explícito
              do adulto responsável com registro de IP e timestamp (LGPD Art.
              14).
            </li>
            <li>
              <strong>Qualidade:</strong> capa dura, papel couché fosco 150g,
              costura reforçada — não é livrinho de impressão caseira.
            </li>
            <li>
              <strong>Revisão humana:</strong> IA é ferramenta, não piloto.
              Nossa equipe aprova página por página.
            </li>
          </ul>

          <div className="pt-8 text-center">
            <Link
              href={settings.primaryCtaHref}
              className="inline-block bg-primary text-white px-8 py-4 rounded-full hover:bg-primary-dark transition text-lg font-medium shadow-lg"
            >
              {settings.primaryCtaLabel}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
