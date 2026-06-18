import Link from "next/link";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-content";
import { getActiveProducts } from "@/lib/products";
import FlipBookSection from "@/components/flipbook/FlipBookSection";

export const metadata: Metadata = {
  title: "Livros infantis personalizados com IA",
  description:
    "Transforme a crianca que voce ama no heroi da propria historia. Livros fisicos capa dura com ilustracoes unicas criadas por IA e revisao humana.",
  openGraph: {
    title: "Era Uma Vez Eu - Livros infantis personalizados com IA",
    description:
      "Transforme a crianca que voce ama no heroi da propria historia.",
    type: "website",
  },
};

const BADGES = [
  { icon: "\uD83C\uDFA8", label: "Ilustra\u00E7\u00F5es \u00FAnicas com IA" },
  {
    icon: "\uD83C\uDFAF",
    label: "100% Personalizado: O rosto da crian\u00E7a em todas as aventuras.",
  },
  {
    icon: "\u221E",
    label: "Temas Infinitos: Voc\u00EA escolhe o universo onde a hist\u00F3ria vai acontecer!",
  },
  { icon: "\uD83D\uDCD6", label: "Capa dura 20 p\u00E1ginas" },
  { icon: "\uD83C\uDDE7\uD83C\uDDF7", label: "Entrega para todo Brasil" },
];

const HOW_STEPS = [
  {
    n: 1,
    title: "Escolha o tema",
    text: "Aventura, mundo dos sonhos, super-her\u00F3i, princesa e mais.",
  },
  {
    n: 2,
    title: "Personalize",
    text: "G\u00EAnero, estilo, cor favorita, faixa et\u00E1ria e fotos da crian\u00E7a.",
  },
  {
    n: 3,
    title: "Escreva sua dedicat\u00F3ria",
    text: "Palavras de carinho que ficar\u00E3o guardadas para a vida toda.",
  },
  {
    n: 4,
    title: "Receba em casa",
    text: "Livro f\u00EDsico capa dura impresso e entregue via Correios.",
  },
];

const HOME_HIGHLIGHTS = [
  {
    emoji: "\uD83C\uDFAF",
    title: "100% Personalizado",
    text: "O rosto da crian\u00E7a em todas as aventuras.",
  },
  {
    emoji: "\u221E",
    title: "Temas Infinitos",
    text: "Voc\u00EA escolhe o universo onde a hist\u00F3ria vai acontecer!",
  },
  {
    emoji: "\uD83D\uDC41\uFE0F",
    title: "Pr\u00E9-visualiza\u00E7\u00E3o",
    text: "Veja como o livro fica antes de finalizar o pedido.",
  },
];

const PRODUCT_TYPE_EMOJI: Record<string, string> = {
  LIVRO_PRINCIPAL: "\uD83D\uDCD5",
  EBOOK: "\uD83D\uDCBB",
  LIVRO_COLORIR: "\uD83D\uDD8D\uFE0F",
  QUEBRA_CABECA: "\uD83E\uDDE9",
  CARTELA_ADESIVOS: "\u2728",
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const TESTIMONIALS = [
  {
    quote:
      "Minha filha chorou quando viu o livro. A ilustra\u00E7\u00E3o ficou id\u00EAntica a ela.",
    author: "Marina, m\u00E3e da Sofia (5 anos)",
  },
  {
    quote:
      "Dei de presente pro meu afilhado e virou o livro favorito da estante.",
    author: "Pedro, padrinho do Davi (3 anos)",
  },
];

function StarDeco({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={"text-gold inline-block " + className}
    >
      <path d="M8 0 L9.5 5.5 L15 8 L9.5 9.5 L8 16 L6.5 9.5 L1 8 L6.5 5.5 Z" />
    </svg>
  );
}

export default async function HomePage() {
  const [products, settings] = await Promise.all([getActiveProducts(), getSiteSettings()]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-warm py-16 md:py-28">
        <div
          className="absolute inset-x-0 top-0 h-72 bg-hero-radial pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative container mx-auto px-4 text-center max-w-3xl">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full bg-gold/20 blur-xl scale-110"
                aria-hidden="true"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpeg"
                alt="Selo Era Uma Vez Eu"
                width={140}
                height={140}
                className="relative rounded-full ring-4 ring-gold/50 shadow-gold-lg"
              />
            </div>
          </div>

          <p className="font-script text-xl text-fox mb-3">{settings.heroEyebrow}</p>

          <h1 className="font-serif text-4xl md:text-6xl text-primary leading-tight">
            {settings.heroTitlePrefix}{" "}
            <span className="underline-gold">{settings.heroTitleHighlight}</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-dark/65 max-w-2xl mx-auto leading-relaxed">
            {settings.heroDescription}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={settings.primaryCtaHref} className="btn-primary-lg">
              {settings.primaryCtaLabel}
            </Link>
            <Link href={settings.secondaryCtaHref} className="btn-ghost">
              {settings.secondaryCtaLabel}
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {BADGES.map((b) => (
              <div key={b.label} className="badge-gold">
                <span aria-hidden="true">{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-12 md:py-16 bg-cream-light">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {HOME_HIGHLIGHTS.map((h) => (
              <div key={h.title} className="card-premium p-6 text-center">
                <div className="text-4xl" aria-hidden="true">
                  {h.emoji}
                </div>
                <h3 className="mt-3 font-serif text-xl text-primary">
                  {h.title}
                </h3>
                <p className="mt-2 text-sm text-dark/65 leading-relaxed">
                  {h.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLIPBOOK / PRE-VISUALIZACAO */}
      <FlipBookSection />

      {/* COMO FUNCIONA */}
      <section className="py-16 md:py-24 bg-cream-warm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-2" aria-hidden="true">
            <StarDeco className="opacity-60 mr-2" />
            <StarDeco className="opacity-40" />
            <StarDeco className="opacity-60 ml-2" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-center text-primary">
            Como funciona
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-5">
            {HOW_STEPS.map((s) => (
              <div
                key={s.n}
                className="card-premium p-6 relative overflow-hidden group"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-cream flex items-center justify-center font-serif text-lg shadow-sm group-hover:bg-primary-light transition-colors duration-250">
                  {s.n}
                </div>
                {s.n < 4 && (
                  <div
                    className="hidden md:block absolute top-11 left-full w-full h-px bg-gold/30 -translate-y-1/2 z-0"
                    aria-hidden="true"
                  />
                )}
                <h3 className="mt-4 font-serif text-xl text-primary">{s.title}</h3>
                <p className="mt-2 text-sm text-dark/65 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/como-funciona"
              className="text-primary hover:text-primary-light font-medium transition-colors duration-200 underline-gold"
            >
              Ver todos os 8 passos &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* PRODUTOS */}
      <section className="py-16 md:py-24 bg-cream-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-2" aria-hidden="true">
            <StarDeco className="opacity-60 mr-2" />
            <StarDeco className="opacity-40" />
            <StarDeco className="opacity-60 ml-2" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-center text-primary">
            Nossos produtos
          </h2>
          <p className="mt-2 text-center text-dark/55">
            Monte o combo perfeito. Adicionais ganham{" "}
            <span className="text-fox font-medium">R$ 15 de desconto</span> quando
            comprados junto do livro capa dura.
          </p>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {products.map((p) => (
              <div
                key={p.id}
                className="card-premium p-6 text-center group cursor-default"
              >
                <div
                  className="text-5xl group-hover:scale-110 transition-transform duration-250 inline-block"
                  aria-hidden="true"
                >
                  {PRODUCT_TYPE_EMOJI[p.type] ?? "🎁"}
                </div>
                <h3 className="mt-4 font-serif text-lg text-primary">{p.name}</h3>
                <p className="mt-2 flex items-baseline justify-center gap-2">
                  {p.priceOld && (
                    <span className="text-dark/35 line-through text-xs">
                      {formatBRL(p.priceOld)}
                    </span>
                  )}
                  <span className="text-fox font-semibold">
                    {formatBRL(p.price)}
                  </span>
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/produtos"
              className="text-primary hover:text-primary-light font-medium transition-colors duration-200 underline-gold"
            >
              Ver todos os produtos &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-16 md:py-24 bg-cream-warm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-2" aria-hidden="true">
            <StarDeco className="opacity-60 mr-2" />
            <StarDeco className="opacity-40" />
            <StarDeco className="opacity-60 ml-2" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-center text-primary">
            Fam&iacute;lias que j&aacute; viveram essa hist&oacute;ria
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.author} className="card-premium p-8 relative">
                <span
                  className="absolute top-4 left-6 font-serif text-6xl text-gold/30 leading-none select-none"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p className="font-serif text-xl text-primary/85 leading-relaxed pt-4">
                  {t.quote}
                </p>
                <footer className="mt-5 flex items-center gap-2">
                  <div className="h-px flex-1 bg-gold/25" />
                  <cite className="text-sm text-dark/55 not-italic">{t.author}</cite>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 md:py-28 bg-cta-premium text-cream relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none select-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle, #E8C94A 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative container mx-auto px-4 text-center max-w-2xl">
          <p className="font-script text-2xl text-gold-warm mb-4">comece agora</p>
          <h2 className="font-serif text-3xl md:text-5xl text-cream leading-tight">
            Pronto para criar o livro da sua fam&iacute;lia?
          </h2>
          <p className="mt-5 text-cream/75 text-lg leading-relaxed">
            Em poucos passos voc&ecirc; monta a hist&oacute;ria completa. Come&ccedil;amos a
            produzir assim que o pagamento &eacute; confirmado.
          </p>
          <Link
            href={settings.primaryCtaHref}
            className="inline-flex items-center gap-2 mt-8 bg-gold text-primary-dark px-8 py-4 rounded-full hover:bg-gold-light transition-all duration-250 text-lg font-semibold shadow-gold-lg hover:shadow-gold hover:scale-105 active:scale-95"
          >
            {settings.primaryCtaLabel}
          </Link>
          <div
            className="mt-8 flex justify-center gap-3 text-gold/50 text-lg"
            aria-hidden="true"
          >
            <StarDeco className="opacity-50" />
            <StarDeco className="opacity-30" />
            <StarDeco className="opacity-50" />
          </div>
        </div>
      </section>
    </>
  );
}
