import Link from "next/link";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-content";
import ScrollRevealTrigger from "@/components/effects/ScrollRevealTrigger";
import MagicStars from "@/components/effects/MagicStars";
import FloatingMagicElements from "@/components/effects/FloatingMagicElements";

export const metadata: Metadata = {
  title: "Como Funciona",
  description:
    "Do primeiro clique ao livro em casa: veja os 8 passos para criar um livro personalizado com IA e revisão humana.",
};

const STEPS = [
  {
    n: 1,
    emoji: "🎨",
    title: "Escolha o Tema",
    text: "Qual é a paixão da criança? Uma aventura com dinossauros, uma jornada mágica na floresta encantada, uma viagem de trem, um conto de princesas, uma grande ação de super-herói ou comédia com robôs? Cada tema guia toda a história.",
  },
  {
    n: 2,
    emoji: "🎭",
    title: "Escolha o Gênero",
    text: "O gênero define o tom da narrativa: Ação (pequenos heróis que amam movimentos rápidos e superação), Comédia (boas gargalhadas e situações engraçadas), Aventura (explorar mundos) ou Mistério (desvendar pistas).",
  },
  {
    n: 3,
    emoji: "🖌️",
    title: "Estilo de Ilustração",
    text: "Escolha o acabamento artístico que mais combina com seu gosto: Aquarela clássica (delicado e lúdico), Desenho a lápis (artístico e detalhado) ou 3D Computadorizado (estilo animação digital moderna).",
  },
  {
    n: 4,
    emoji: "🌈",
    title: "Cor Favorita",
    text: "Qual tom faz os olhos da criança brilharem? A cor preferida do pequeno herói ou heroína vira protagonista nos detalhes da capa, nas molduras das páginas e nos elementos mágicos das artes.",
  },
  {
    n: 5,
    emoji: "👶",
    title: "Faixa Etária",
    text: "Adaptamos a linguagem e o ritmo da história para cada fase: 0 a 3 anos (textos curtos, rimas e sonoridade), 4 a 6 anos (narrativa envolvente e diálogos simples) e 7 a 10 anos (narrativas elaboradas).",
  },
  {
    n: 6,
    emoji: "📸",
    title: "Envie as Fotos",
    text: "Faça o upload de 1 a 3 fotos do rostinho da criança, bem iluminadas e de frente. Nossa inteligência artificial utilizará essas imagens para desenhar a criança na história de forma natural.",
  },
  {
    n: 7,
    emoji: "✍️",
    title: "Dedicatória Especial",
    text: "Torne o livro uma lembrança inesquecível para toda a vida. Digite uma mensagem especial de amor que será impressa logo na primeira página de abertura do livro.",
  },
  {
    n: 8,
    emoji: "📦",
    title: "Impresso & Entregue",
    text: "Nossos designers revisam cada detalhe do rosto gerado manualmente. Após sua aprovação, o livro físico capa dura premium é impresso e despachado direto para sua casa.",
  },
];

export default async function ComoFuncionaPage() {
  const settings = await getSiteSettings();

  return (
    <div className="bg-cream min-h-screen relative overflow-hidden pb-24">
      {/* Scroll Reveal Activator */}
      <ScrollRevealTrigger />

      {/* Decorative stars */}
      <MagicStars count={15} />

      {/* HEADER SECTION */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden bg-cream-to-white border-b border-cream-deep/20 text-center">
        {/* Floating Storytelling Magic Icons (stars, moon, book, key) */}
        <FloatingMagicElements />

        <div className="container mx-auto px-4 max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-4 py-2 rounded-full">
            <span className="text-xs text-primary font-bold uppercase tracking-wider">✨ Passo a Passo Mágico</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-primary leading-tight tracking-tight">
            Como funciona a criação do seu livro
          </h1>
          <p className="text-base md:text-lg text-dark/70 max-w-2xl mx-auto leading-relaxed">
            Do primeiro clique no nosso Wizard até o livro físico capa dura impresso e exposto na estante da criança.
          </p>
        </div>
      </section>

      {/* ALTERNATING TIMELINE SECTION */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 max-w-4xl relative">
          
          {/* Central Vertical Connector Line for Desktop */}
          <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-[2px] bg-gradient-to-b from-gold/25 via-gold/50 to-gold/25 border-l border-dashed border-gold/40 -translate-x-1/2 z-0" />

          <div className="space-y-12 md:space-y-20 relative z-10">
            {STEPS.map((s, idx) => {
              const isEven = idx % 2 === 1;
              return (
                <div
                  key={s.n}
                  className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 reveal-on-scroll ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Step Card */}
                  <div className="w-full md:w-[45%]">
                    <div className="bg-white rounded-[32px] border border-cream-deep/30 p-8 shadow-premium hover:shadow-lg hover:border-gold/30 transition-all duration-300 group flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-full bg-rose flex items-center justify-center text-xl shadow-inner select-none">
                          {s.emoji}
                        </div>
                        <span className="font-serif text-4xl font-semibold text-gold/30 italic group-hover:text-gold transition-colors duration-300">
                          {s.n < 10 ? `0${s.n}` : s.n}
                        </span>
                      </div>
                      
                      <h2 className="font-serif text-2xl text-primary font-semibold group-hover:text-gold transition-colors duration-300">
                        {s.title}
                      </h2>
                      
                      <p className="text-xs text-dark/65 leading-relaxed">
                        {s.text}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Center Timeline Node */}
                  <div className="hidden md:flex w-12 h-12 rounded-full bg-primary text-cream border-4 border-cream flex-shrink-0 items-center justify-center font-serif font-bold text-lg shadow-md z-20">
                    {s.n}
                  </div>

                  {/* Spacer to push card layout correctly */}
                  <div className="hidden md:block w-[45%]" />
                </div>
              );
            })}
          </div>

          {/* FINAL CTA BOX */}
          <div className="mt-24 bg-primary text-cream rounded-[32px] border border-cream-deep/10 p-8 md:p-12 text-center max-w-2xl mx-auto shadow-xl relative overflow-hidden reveal-on-scroll">
            <MagicStars count={12} />
            <div className="relative z-10 space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl text-cream leading-tight">
                Pronto para dar vida à história?
              </h2>
              <p className="text-xs text-cream/70 leading-relaxed max-w-md mx-auto">
                Preencher os dados da criança leva menos de 5 minutos. Você acompanha cada etapa e aprova as imagens antes do envio!
              </p>
              <Link
                href={settings.primaryCtaHref}
                className="bg-gold text-primary hover:bg-gold-light active:scale-95 px-8 py-4 rounded-full font-bold uppercase tracking-wide text-xs transition-all duration-300 inline-flex items-center gap-2 shadow-gold"
              >
                <span>{settings.primaryCtaLabel}</span>
                <span>→</span>
              </Link>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
}
