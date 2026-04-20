import Link from "next/link";
import type { Metadata } from "next";
import { PRIMARY_CTA } from "@/lib/site-config";
import FlipBookSection from "@/components/flipbook/FlipBookSection";

export const metadata: Metadata = {
  title: "Livros infantis personalizados com IA",
  description:
    "Transforme a criança que você ama no herói da própria história. Livros físicos capa dura com ilustrações únicas criadas por IA e revisão humana.",
  openGraph: {
    title: "Era Uma Vez Eu — Livros infantis personalizados com IA",
    description:
      "Transforme a criança que você ama no herói da própria história.",
    type: "website",
  },
};

const BADGES = [
  { icon: "🎨", label: "Ilustrações únicas com IA" },
  { icon: "📖", label: "Capa dura 20 páginas" },
  { icon: "🇧🇷", label: "Entrega para todo Brasil" },
];

const HOW_STEPS = [
  {
    n: 1,
    title: "Escolha o tema",
    text: "Aventura, mundo dos sonhos, super-herói, princesa e mais.",
  },
  {
    n: 2,
    title: "Personalize",
    text: "Nome, idade, estilo, foto e dedicatória da criança.",
  },
  {
    n: 3,
    title: "Aprovamos juntos",
    text: "Geramos o prompt, nossa equipe ilustra e você revisa.",
  },
  {
    n: 4,
    title: "Receba em casa",
    text: "Livro físico capa dura impresso e entregue via Correios.",
  },
];

const PRODUCTS_PREVIEW = [
  { emoji: "📕", name: "Livro personalizado", price: "R$ 189,90" },
  { emoji: "💻", name: "E-book digital", price: "R$ 39,90" },
  { emoji: "🖍️", name: "Livro de colorir", price: "R$ 49,90" },
  { emoji: "🧩", name: "Quebra-cabeça", price: "R$ 69,90" },
];

const TESTIMONIALS = [
  {
    quote:
      "Minha filha chorou quando viu o livro. A ilustração ficou idêntica a ela.",
    author: "Marina, mãe da Sofia (5 anos)",
  },
  {
    quote:
      "Dei de presente pro meu afilhado e virou o livro favorito da estante.",
    author: "Pedro, padrinho do Davi (3 anos)",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-light to-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="font-serif text-4xl md:text-6xl text-dark leading-tight">
            Transforme a criança que você ama no{" "}
            <span className="text-primary">herói da própria história</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-dark/70">
            Livros infantis personalizados com ilustrações únicas criadas por IA
            e revisão humana. Capa dura, impressão premium, entrega em todo
            Brasil.
          </p>
          <Link
            href={PRIMARY_CTA.href}
            className="inline-block mt-8 bg-primary text-white px-8 py-4 rounded-full hover:bg-primary-dark transition text-lg font-medium shadow-lg"
          >
            {PRIMARY_CTA.label}
          </Link>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {BADGES.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-2 bg-white/80 border border-primary/10 rounded-full px-4 py-2 text-sm"
              >
                <span aria-hidden>{b.icon}</span>
                <span className="text-dark/80">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FlipBookSection />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl text-center text-dark">
            Como funciona
          </h2>
          <p className="mt-2 text-center text-dark/60">
            Do clique ao presente em até 12 dias úteis.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            {HOW_STEPS.map((s) => (
              <div
                key={s.n}
                className="bg-white rounded-2xl p-6 border border-primary/10 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-serif text-lg">
                  {s.n}
                </div>
                <h3 className="mt-4 font-serif text-xl text-dark">{s.title}</h3>
                <p className="mt-2 text-sm text-dark/70">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/como-funciona"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Ver todos os 8 passos →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl text-center text-dark">
            Nossos produtos
          </h2>
          <p className="mt-2 text-center text-dark/60">
            Monte o combo perfeito. R$ 20 de desconto em cada adicional quando
            comprado com o livro.
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {PRODUCTS_PREVIEW.map((p) => (
              <div
                key={p.name}
                className="bg-light rounded-2xl p-6 text-center border border-primary/10"
              >
                <div className="text-5xl" aria-hidden>
                  {p.emoji}
                </div>
                <h3 className="mt-4 font-serif text-lg text-dark">{p.name}</h3>
                <p className="mt-2 text-primary font-medium">{p.price}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/produtos"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Ver todos os produtos →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl text-center text-dark">
            Famílias que já viveram essa história
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.author}
                className="bg-white rounded-2xl p-8 border border-primary/10 shadow-sm"
              >
                <p className="font-serif text-xl text-dark/90 leading-relaxed">
                  “{t.quote}”
                </p>
                <footer className="mt-4 text-sm text-dark/60">
                  — {t.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl">
            Pronto pra criar o livro da sua família?
          </h2>
          <p className="mt-4 text-white/90 text-lg">
            Em 7 passos simples você monta a história completa. Começamos a
            produzir só depois da sua aprovação.
          </p>
          <Link
            href={PRIMARY_CTA.href}
            className="inline-block mt-8 bg-white text-primary px-8 py-4 rounded-full hover:bg-light transition text-lg font-medium shadow-lg"
          >
            {PRIMARY_CTA.label}
          </Link>
        </div>
      </section>
    </>
  );
}
