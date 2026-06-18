import Link from "next/link";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Para Todas as Ocasiões",
  description:
    "Muito além dos contos de fadas: transformamos pets, formaturas, viagens, bodas e qualquer momento especial em um livro personalizado capa dura.",
};

const OCCASIONS = [
  {
    emoji: "🐾",
    title: "Pets",
    text: "Transforme seu pet no protagonista de uma aventura única e eternize o amor pelo seu companheiro.",
  },
  {
    emoji: "🎓",
    title: "Formaturas",
    text: "Celebre anos de dedicação com um livro que ilustra essa grande conquista profissional.",
  },
  {
    emoji: "✈️",
    title: "Viagens Inesquecíveis",
    text: "Faça das memórias daquela viagem dos sonhos uma verdadeira história de cinema.",
  },
  {
    emoji: "💍",
    title: "Relacionamentos e Bodas",
    text: "O romance de vocês contado e ilustrado com todo o afeto que a história do casal merece.",
  },
  {
    emoji: "🎉",
    title: "Qualquer Ocasião",
    text: "Uma amizade especial, um aniversário surpresa ou uma homenagem de família. Você sonha, nós criamos!",
  },
];

export default async function ParaTodasOcasioesPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-to-b from-light to-primary/5">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="font-script text-xl text-fox mb-3">
            Para todas as ocasiões
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-dark leading-tight">
            Muito Além dos Contos de Fadas: Eternize Qualquer Momento!
          </h1>
          <p className="mt-6 text-lg text-dark/70 leading-relaxed">
            A magia da Era Uma Vez, Eu, não tem idade nem limites. Com a mesma
            qualidade premium, tecnologia de ponta e carinho que dedicamos aos
            nossos livros infantis, nós transformamos qualquer capítulo especial
            da sua vida em uma obra de arte inesquecível.
          </p>
        </div>
      </section>

      <section className="py-16 bg-cream-warm">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-primary">
            Você pode criar um livro personalizado para:
          </h2>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {OCCASIONS.map((o) => (
              <div key={o.title} className="card-premium p-6">
                <div className="text-4xl" aria-hidden="true">
                  {o.emoji}
                </div>
                <h3 className="mt-3 font-serif text-xl text-primary">
                  {o.title}
                </h3>
                <p className="mt-2 text-sm text-dark/65 leading-relaxed">
                  {o.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 max-w-3xl mx-auto card-premium p-8 text-center">
            <h3 className="font-serif text-xl text-primary">
              A mesma magia, com as mesmas condições
            </h3>
            <p className="mt-3 text-dark/70 leading-relaxed">
              Todos os projetos para essas ocasiões contam com a nossa capa dura
              com laminação premium, ilustrações ultrarrealistas personalizadas e
              papel de alta gramatura.
            </p>
          </div>

          <div className="mt-12 text-center">
            <p className="text-dark/70 max-w-2xl mx-auto leading-relaxed">
              Quer começar a contar essa história? Fale com a nossa equipe com os
              detalhes do seu momento e as fotos necessárias, e deixe a gente
              preparar algo extraordinário para você!
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={settings.primaryCtaHref} className="btn-primary-lg">
                {settings.primaryCtaLabel}
              </Link>
              <Link href="/contato" className="btn-ghost">
                Falar com a equipe
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
