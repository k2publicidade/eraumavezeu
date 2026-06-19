import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-content";
import ScrollRevealTrigger from "@/components/effects/ScrollRevealTrigger";
import MagicStars from "@/components/effects/MagicStars";
import FloatingMagicElements from "@/components/effects/FloatingMagicElements";

export const metadata: Metadata = {
  title: "Livros para Todas as Ocasiões | Era Uma Vez, Eu",
  description:
    "Pets, formaturas, casamentos, viagens ou qualquer momento especial transformado em um livro personalizado de capa dura premium com ilustrações exclusivas.",
};

const OCCASIONS = [
  {
    emoji: "🐾",
    title: "Pets & Companheiros",
    text: "Eternize a história do seu melhor amigo de quatro patas. Um diário ilustrado de travessuras e companheirismo.",
    bullets: ["Memorial & Homenagens", "Primeiros anos do filhote", "Aventuras com a família"],
  },
  {
    emoji: "🎓",
    title: "Formaturas & Conquistas",
    text: "A trajetória de dedicação, noites de estudo e a vitória do diploma registrada em uma biografia visual.",
    bullets: ["Álbum de formatura ilustrado", "Presente de pais para filhos", "Recordação para a vida inteira"],
  },
  {
    emoji: "✈️",
    title: "Viagens Inesquecíveis",
    text: "Aquelas férias dos sonhos, mochilão ou lua de mel transformados em um diário de bordo com ilustrações cinematográficas.",
    bullets: ["Cronologia da viagem", "Fotos de paisagens ilustradas", "Textos com memórias locais"],
  },
  {
    emoji: "💍",
    title: "Casamentos & Bodas",
    text: "A história de amor do casal, desde o primeiro encontro até o 'sim'. O presente ideal para aniversários de namoro ou bodas.",
    bullets: ["Linha do tempo do romance", "Ilustração dos votos de casamento", "Presente de casamento emocionante"],
  },
  {
    emoji: "🌳",
    title: "História de Família",
    text: "Homenageie avós, pais ou irmãos reunindo as memórias de gerações em uma árvore genealógica ricamente ilustrada.",
    bullets: ["Homenagem para avós", "Livro de receitas de família", "Nascimento do bebê"],
  },
  {
    emoji: "🎨",
    title: "Qualquer Inspiração",
    text: "Uma amizade eterna, uma homenagem especial ou sua própria biografia. Sem limites para a imaginação.",
    bullets: ["Projetos artísticos autorais", "Homenagens especiais", "Projetos corporativos premium"],
  },
];

const STEPS = [
  {
    num: "01",
    title: "Fale Conosco",
    desc: "Entre em contato via WhatsApp ou envie um formulário detalhando o tema da história que deseja criar.",
  },
  {
    num: "02",
    title: "Envie as Fotos",
    desc: "Forneça as imagens de referência da pessoa, casal, pet ou local. Nossa equipe fará a triagem técnica das fotos.",
  },
  {
    num: "03",
    title: "Aprovação Digital",
    desc: "Nossos designers criam a história e as ilustrações, enviando uma prévia em PDF para que você aprove cada detalhe.",
  },
  {
    num: "04",
    title: "Produção & Entrega",
    desc: "Com o layout aprovado por você, o livro é impresso em capa dura com acabamento premium e despachado para sua casa.",
  },
];

export default async function ParaTodasOcasioesPage() {
  const settings = await getSiteSettings();

  return (
    <div className="bg-cream min-h-screen relative overflow-hidden pb-16">
      {/* Scroll Reveal Trigger */}
      <ScrollRevealTrigger />

      {/* Background Magic Stars */}
      <MagicStars count={15} />

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 overflow-hidden border-b border-cream-deep/20">
        {/* Floating Storytelling Magic Icons (stars, moon, book, key) */}
        <FloatingMagicElements />

        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12 items-center">
            
            {/* Hero Left: Text & CTA */}
            <div className="space-y-5 text-left z-10">
              <div className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/30 px-3 py-1 rounded-full">
                <span className="text-[10px] text-primary font-bold uppercase tracking-[0.18em]">
                  Personalização Sem Limites
                </span>
              </div>
              
              <h1 className="font-serif text-4xl md:text-5xl text-primary leading-tight tracking-tight">
                Muito Além dos Contos de Fadas:<br />
                <span className="text-gold">Eternize Qualquer Momento!</span>
              </h1>
              
              <p className="text-xs md:text-sm text-dark/70 leading-relaxed font-body max-w-xl">
                A magia da Era Uma Vez, Eu, não tem idade nem limites. Com a mesma qualidade premium e carinho de nossos livros infantis, nós transformamos qualquer capítulo especial da sua vida em uma obra de arte física inesquecível.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href={settings.primaryCtaHref}
                  className="bg-primary text-cream hover:bg-primary-light active:scale-95 text-center px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs shadow-md transition-all duration-300"
                >
                  {settings.primaryCtaLabel}
                </Link>
                <Link
                  href="/contato"
                  className="bg-white text-primary border border-cream-deep/30 hover:border-gold/30 active:scale-95 text-center px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs shadow-sm transition-all duration-300"
                >
                  Falar com a Equipe
                </Link>
              </div>
            </div>

            {/* Hero Right: Styled Mockup Image Display */}
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-premium border border-cream-deep/20 hover:scale-[1.01] transition-transform duration-500">
              <Image
                src="/occasions_books.png"
                alt="Livros personalizados para diferentes ocasiões"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 500px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
            </div>

          </div>
        </div>
      </section>

      {/* OCCASIONS GRID SECTION */}
      <section className="py-12 md:py-16 relative">
        <div className="container mx-auto px-4 max-w-5xl space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] block">
              Galeria de Histórias
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-primary font-medium">
              Podemos Criar um Livro Especial Para:
            </h2>
            <p className="text-xs text-dark/65 max-w-md mx-auto font-body">
              Seja qual for a sua lembrança, nossa equipe está pronta para transformá-la em ilustrações de alto padrão.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OCCASIONS.map((o) => (
              <div
                key={o.title}
                className="reveal-on-scroll bg-white rounded-[24px] border border-cream-deep/20 p-5 shadow-premium hover:shadow-xl hover:border-gold/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Styled Icon Wrapper */}
                  <div className="w-10 h-10 rounded-full bg-rose/30 border border-gold/20 flex items-center justify-center text-xl select-none group-hover:scale-110 transition-transform duration-300">
                    {o.emoji}
                  </div>
                  
                  <h3 className="font-serif text-lg font-bold text-primary group-hover:text-gold transition-colors duration-300">
                    {o.title}
                  </h3>
                  
                  <p className="text-[11px] text-dark/65 leading-relaxed font-body">
                    {o.text}
                  </p>
                </div>

                {/* Subtopics bullet suggestions */}
                <div className="pt-3 mt-4 border-t border-cream-deep/15">
                  <ul className="space-y-1 text-[9px] text-dark/50 font-body">
                    {o.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-gold font-bold">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* HOW IT WORKS (STEPPER) */}
      <section className="py-12 md:py-16 border-t border-cream-deep/15 bg-cream/40">
        <div className="container mx-auto px-4 max-w-5xl space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] block">
              Como Funciona
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-primary font-medium">
              4 Passos Para Seu Livro Sob Medida
            </h2>
            <p className="text-xs text-dark/65 max-w-md mx-auto font-body">
              Entenda como funciona o nosso processo especial de atendimento para projetos sob medida.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <div
                key={s.num}
                className="reveal-on-scroll bg-white p-5 rounded-2xl border border-cream-deep/15 shadow-sm relative group hover:border-gold/30 transition-all duration-300"
              >
                <div className="font-serif text-3xl font-extrabold text-gold/20 absolute top-4 right-4 group-hover:text-gold/40 transition-colors">
                  {s.num}
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif text-sm font-bold text-primary pt-2">
                    {s.title}
                  </h4>
                  <p className="text-[10px] text-dark/60 leading-relaxed font-body">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* QUALITY ASSURANCE BOX */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="reveal-on-scroll bg-white rounded-[24px] border border-cream-deep/20 p-6 md:p-8 text-center space-y-4 shadow-premium hover:border-gold/25 transition-all duration-500">
            <h3 className="font-serif text-xl md:text-2xl text-primary font-semibold">
              A mesma magia, com as mesmas condições premium
            </h3>
            <p className="text-xs text-dark/70 leading-relaxed max-w-2xl mx-auto font-body">
              Todos os projetos contam com a nossa capa dura de alta resistência laminada antirrisco, miolo impresso em alta definição com papel couché importado (170g) e revisão manual de designers profissionais.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[9px] font-bold text-gold bg-gold/5 border border-gold/20 px-3 py-1 rounded-full uppercase tracking-wider font-body">
                🛡️ Satisfação Garantida ou Seu Dinheiro de Volta
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-8 relative">
        <div className="container mx-auto px-4 max-w-2xl text-center space-y-5">
          <p className="text-xs text-dark/70 font-body max-w-md mx-auto leading-relaxed">
            Quer começar a contar essa história? Clique abaixo para iniciar o seu pedido ou fale com a nossa equipe de atendimento no WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={settings.primaryCtaHref}
              className="w-full sm:w-auto bg-primary text-cream hover:bg-primary-light active:scale-95 px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs shadow-md transition-all duration-300"
            >
              {settings.primaryCtaLabel}
            </Link>
            <Link
              href="/contato"
              className="w-full sm:w-auto bg-white text-primary border border-cream-deep/30 hover:border-gold/30 active:scale-95 px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs shadow-sm transition-all duration-300 block text-center"
            >
              Falar com a Equipe
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
