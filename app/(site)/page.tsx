import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-content";
import { getActiveProducts } from "@/lib/products";
import MagicStars from "@/components/effects/MagicStars";
import ScrollRevealTrigger from "@/components/effects/ScrollRevealTrigger";
import InteractiveBook from "@/components/site/InteractiveBook";
import FloatingMagicElements from "@/components/effects/FloatingMagicElements";
import AddToCartButton from "@/components/cart/AddToCartButton";
import HeroScrollVideo from "@/components/site/HeroScrollVideo";

export const metadata: Metadata = {
  title: "Livros infantis personalizados com IA",
  description:
    "Transforme a criança que você ama no herói da própria história. Livros físicos capa dura com ilustrações únicas criadas por IA e revisão humana.",
  openGraph: {
    title: "Era Uma Vez Eu - Livros infantis personalizados com IA",
    description:
      "Transforme a criança que você ama no herói da própria história.",
    type: "website",
  },
};

const BENEFITS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#E63956]">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
      </svg>
    ),
    title: "Um presente cheio de amor",
    text: "Surpreenda com um presente inesquecível e com alto apelo emocional.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#3CA0D8]">
        <path d="M12 21c-1.1-1.1-2.78-1.5-4.5-1.5S4.1 19.9 3 21V6c1.1-1.1 2.78-1.5 4.5-1.5S10.9 4.9 12 6c1.1-1.1 2.78-1.5 4.5-1.5S19.9 4.1 21 6v15c-1.1-1.1-2.78-1.5-4.5-1.5S13.1 19.9 12 21z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M12 6v15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Sua história, do seu jeito",
    text: "Personalize cada detalhe para criar uma história única e especial.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#FF6B6B]">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 3.07 1.97 5.67 4.74 6.6L8 22h8l-1.74-6.4C17.03 14.67 19 12.07 19 9c0-3.87-3.13-7-7-7z" fill="currentColor" />
      </svg>
    ),
    title: "Feito para durar gerações",
    text: "Um livro físico de altíssima qualidade que passa de geração em geração.",
  },
];

const MOBILE_BENEFITS = [
  {
    icon: "🎯",
    title: "100% Personalizado",
    text: "O rosto da criança em todas as aventuras.",
  },
  {
    icon: "∞",
    title: "Temas Infinitos",
    text: "Você escolhe o universo onde a história vai acontecer!",
  },
  {
    icon: "👁️",
    title: "Pré-visualização",
    text: "Veja como o livro fica antes de finalizar o pedido.",
  },
];

const HOW_STEPS = [
  {
    n: 1,
    title: "Escolha o tema",
    text: "Selecione o tema que mais combina com a criança.",
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 3C4 1.89543 4.89543 1 6 1H18C19.1046 1 20 1.89543 20 3V21C20 22.1046 19.1046 23 18 23H6C4.89543 23 4 22.1046 4 21V3Z" fill="#E52E5E" />
        <path d="M4 20C4 19.4477 4.44772 19 5 19H20V21.5C20 22.3284 19.3284 23 18.5 23H5.5C4.67157 23 4 22.3284 4 21.5V20Z" fill="#B01C41" />
        <path d="M12 15.5L11.125 14.7C8.025 11.89 5.975 10.03 5.975 7.76C5.975 5.9 7.425 4.45 9.275 4.45C10.325 4.45 11.3375 4.94 12 5.7C12.6625 4.94 13.675 4.45 14.725 4.45C16.575 4.45 18.025 5.9 18.025 7.76C18.025 10.03 15.975 11.89 12.875 14.71L12 15.5Z" fill="white" />
      </svg>
    ),
  },
  {
    n: 2,
    title: "Personalize a história",
    text: "Conte detalhes, envie fotos e personalize os personagens.",
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="14" height="20" rx="2" fill="#3CA0D8" />
        <line x1="7" y1="7" x2="15" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="7" y1="12" x2="13" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="7" y1="17" x2="11" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M14.5 17.5L21 11L22.5 12.5L16 19H14.5V17.5Z" fill="#FFD369" />
        <path d="M21 11L22.5 12.5L21.5 13.5L20 12L21 11Z" fill="#E0A92E" />
        <path d="M14.5 19H15.5L14.5 18V19Z" fill="#333333" />
      </svg>
    ),
  },
  {
    n: 3,
    title: "Aprovação final",
    text: "Veja uma prévia e faça ajustes para deixar tudo perfeito.",
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="#56B25A" />
        <path d="M8.5 12.5L11 15L16 9" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: 4,
    title: "Receba o livro",
    text: "Seu livro impresso, com muito carinho, na sua casa.",
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="9" width="16" height="13" rx="1" fill="#ED8E3B" />
        <rect x="3" y="6" width="18" height="4" rx="1" fill="#ED8E3B" />
        <rect x="11" y="6" width="2" height="16" fill="white" />
        <path d="M12 6C9.5 4.5 8 2 10.5 2C12.5 2 12 6 12 6Z" fill="white" />
        <path d="M12 6C14.5 4.5 16 2 13.5 2C11.5 2 12 6 12 6Z" fill="white" />
      </svg>
    ),
  },
];

const WHY_US = [
  {
    title: "Personalização total",
    text: "Cada detalhe feito para ser único",
  },
  {
    title: "Qualidade premium",
    text: "Materiais de alta qualidade e impressão impecável",
  },
  {
    title: "Entrega rápida",
    text: "Enviamos para todo o Brasil",
  },
  {
    title: "Atendimento humano",
    text: "Estamos com você em cada etapa",
  },
  {
    title: "Satisfação garantida",
    text: "Garantia de amor e encantamento",
  },
];

const WHY_US_ICONS = [
  // 1. Personalização total
  (
    <svg key="icon-1" className="w-5 h-5 text-[#E63956]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  // 2. Qualidade premium
  (
    <svg key="icon-2" className="w-5 h-5 text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  // 3. Entrega rápida
  (
    <svg key="icon-3" className="w-5 h-5 text-[#339933]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 011-1v-4a1 1 0 01.816-.983L18 10h3a1 1 0 011 1v4a1 1 0 01-1 1h-2" />
    </svg>
  ),
  // 4. Atendimento humano
  (
    <svg key="icon-4" className="w-5 h-5 text-[#8A2BE2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  // 5. Satisfação garantida
  (
    <svg key="icon-5" className="w-5 h-5 text-[#FF8C00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
];

const WHY_US_BG = [
  "bg-[#FFEBF0]", // light pink
  "bg-[#EBF5FF]", // light blue
  "bg-[#EBF7EB]", // light green
  "bg-[#F5EBFF]", // light purple
  "bg-[#FFF2E0]", // light orange
];

const PRODUCT_MOCKUPS: Record<string, string> = {
  LIVRO_PRINCIPAL: "/livro/Era Uma Vez - Bernardo_Página_01.jpg",
  EBOOK: "/ebook_mockup.png",
  LIVRO_COLORIR: "/coloring_book_mockup.png",
  QUEBRA_CABECA: "/puzzle_mockup.png",
  CARTELA_ADESIVOS: "/stickers_mockup.png",
};

const PRODUCT_BADGES: Record<string, string> = {
  LIVRO_PRINCIPAL: "Item Estrela",
  EBOOK: "Prático & Digital",
  LIVRO_COLORIR: "Criatividade & Arte",
  QUEBRA_CABECA: "Desafio & Raciocínio",
  CARTELA_ADESIVOS: "Mimo Exclusivo",
};

const PRODUCT_FEATURES: Record<string, string[]> = {
  LIVRO_PRINCIPAL: [
    "Capa dura costurada premium",
    "20 páginas Couché 170g",
    "Tamanho deitado (30x21cm)",
  ],
  EBOOK: [
    "Formato PDF de alta definição",
    "Disponível em qualquer tela",
    "Envio imediato no e-mail",
  ],
  LIVRO_COLORIR: [
    "20 páginas personalizadas",
    "Protagonizado pela criança",
    "Papel grosso offset p/ canetinhas",
  ],
  QUEBRA_CABECA: [
    "60 peças em papelão cartonado",
    "Tamanho A4 (29x21 cm)",
    "Encaixe suave de alta durabilidade",
  ],
  CARTELA_ADESIVOS: [
    "Super cartela A4 vinílica",
    "Mais de 25 adesivos cortados",
    "Resistente a água e riscos",
  ],
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const TESTIMONIALS = [
  {
    quote: "Meu filho se emocionou ao se ver como herói da história. Um presente que vamos guardar para sempre.",
    author: "Juliana S. - Mãe do Pedro",
    stars: 5,
  },
  {
    quote: "A qualidade do livro é incrível e o atendimento foi impecável do início ao fim. Super recomendo!",
    author: "Carlos M. - Pai da Sofia",
    stars: 5,
  },
];

export default async function HomePage() {
  const [products, settings] = await Promise.all([getActiveProducts(), getSiteSettings()]);

  return (
    <div className="relative overflow-hidden bg-cream">
      {/* Scroll Reveal Observer activator */}
      <ScrollRevealTrigger />

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-24 md:py-32 overflow-hidden bg-cream-to-white">
        {/* Scroll-driven Video Background (Constrained to right side on desktop, hidden on mobile) */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 lg:w-[58%] z-0 pointer-events-none overflow-hidden mask-video-fade">
          <HeroScrollVideo />
        </div>

        {/* Radial gold glow overlay */}
        <div className="absolute inset-0 bg-hero-radial pointer-events-none z-10" />

        {/* Animated Magic Stars floating background */}
        <MagicStars count={25} />
        
        {/* Floating Storytelling Magic Icons (stars, moon, book, key) */}
        <FloatingMagicElements />
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">
            
            {/* Desktop Hero Content (Image 3 style) */}
            <div className="hidden lg:block space-y-8 text-left max-w-xl mx-auto lg:mx-0">
              <div 
                className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-4 py-2 rounded-full animate-fade-up"
                style={{ animationDelay: "100ms", animationFillMode: "both" }}
              >
                <span className="text-xs text-primary font-bold uppercase tracking-wider">✦ 100% PERSONALIZADO</span>
              </div>
              
              <h1 
                className="font-serif text-5xl md:text-6xl text-primary leading-[1.08] tracking-tight animate-fade-up"
                style={{ animationDelay: "250ms", animationFillMode: "both" }}
              >
                Transforme a criança que você ama no herói da <span className="font-[Georgia,serif] italic text-gold font-normal">própria</span> história
              </h1>
              
              <p 
                className="text-base md:text-lg text-dark/70 leading-relaxed font-sans animate-fade-up"
                style={{ animationDelay: "400ms", animationFillMode: "both" }}
              >
                Um livro personalizado e ilustrado que transforma momentos especiais em memórias para toda a vida. Feito sob medida com tecnologia de ponta e carinho humano.
              </p>
              
              <div 
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-fade-up"
                style={{ animationDelay: "550ms", animationFillMode: "both" }}
              >
                <Link
                  href={settings.primaryCtaHref}
                  className="bg-primary text-cream hover:bg-primary-light hover:scale-105 active:scale-95 text-center px-8 py-4.5 rounded-full font-bold uppercase tracking-wide text-xs shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>CRIAR MEU LIVRO</span>
                  <span className="text-gold">→</span>
                </Link>
                <Link
                  href="#como-funciona"
                  className="bg-white border border-primary/20 text-primary hover:bg-cream-light text-center px-8 py-4.5 rounded-full font-bold uppercase tracking-wide text-xs transition-all duration-300"
                >
                  COMO FUNCIONA
                </Link>
              </div>

              <div 
                className="flex flex-wrap gap-4 text-xs font-semibold text-dark/60 pt-2 animate-fade-up"
                style={{ animationDelay: "700ms", animationFillMode: "both" }}
              >
                <span className="flex items-center gap-1.5">✓ Ilustrações exclusivas</span>
                <span className="flex items-center gap-1.5">✓ Capa dura premium</span>
                <span className="flex items-center gap-1.5">✓ Entrega em todo o Brasil</span>
              </div>


            </div>

            {/* Mobile Hero Content (Centered, Image 1 style) */}
            <div className="block lg:hidden text-center space-y-6 max-w-xl mx-auto">
              <div 
                className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-4 py-1.5 rounded-full animate-fade-up mx-auto"
                style={{ animationDelay: "50ms", animationFillMode: "both" }}
              >
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">✦ 100% Personalizado</span>
              </div>

              <h1 
                className="font-serif text-3xl sm:text-4xl text-primary leading-tight px-2 font-semibold animate-fade-up"
                style={{ animationDelay: "150ms", animationFillMode: "both" }}
              >
                Transforme quem você ama no herói da <span className="font-[Georgia,serif] italic text-gold font-normal">própria</span> história
              </h1>
              
              <p 
                className="text-sm sm:text-base text-dark/70 leading-relaxed font-sans px-4 animate-fade-up"
                style={{ animationDelay: "250ms", animationFillMode: "both" }}
              >
                Um livro infantil ilustrado feito sob medida. O rosto da criança em todas as aventuras com ilustrações ricas em detalhes geradas por IA e acabamento premium em capa dura.
              </p>
              
              {/* Centered Mobile Scroll Video Card */}
              <div 
                className="w-full max-w-[320px] sm:max-w-[380px] mx-auto py-2 animate-fade-up"
                style={{ animationDelay: "350ms", animationFillMode: "both" }}
              >
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-gold/25 bg-white shadow-lg">
                  <HeroScrollVideo />
                </div>
              </div>
              
              <div 
                className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4 pt-2 animate-fade-up"
                style={{ animationDelay: "450ms", animationFillMode: "both" }}
              >
                <Link
                  href={settings.primaryCtaHref}
                  className="w-full sm:w-auto bg-primary text-cream hover:bg-primary-light hover:scale-105 active:scale-95 text-center px-8 py-4 rounded-full font-bold uppercase tracking-wide text-xs shadow-lg transition-all duration-300"
                >
                  Criar meu livro
                </Link>
                <Link
                  href="#como-funciona"
                  className="w-full sm:w-auto bg-white border border-primary/20 text-primary hover:bg-cream-light text-center px-8 py-4 rounded-full font-bold uppercase tracking-wide text-xs transition-all duration-300"
                >
                  Como funciona
                </Link>
              </div>

              {/* Centered Tags (Image 1 style) */}
              <div 
                className="flex flex-wrap justify-center gap-2.5 px-2 pt-2 animate-fade-up"
                style={{ animationDelay: "550ms", animationFillMode: "both" }}
              >
                <span className="bg-[#FFFDF9] border border-gold/25 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-primary flex items-center gap-1.5 shadow-sm">
                  <span>🎨</span> Ilustrações únicas com IA
                </span>
                <span className="bg-[#FFFDF9] border border-gold/25 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-primary flex items-center gap-1.5 shadow-sm">
                  <span>🎯</span> Rosto da criança nas páginas
                </span>
                <span className="bg-[#FFFDF9] border border-gold/25 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-primary flex items-center gap-1.5 shadow-sm">
                  <span>∞</span> Escolha seu universo favorito
                </span>
                <span className="bg-[#FFFDF9] border border-gold/25 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-primary flex items-center gap-1.5 shadow-sm">
                  <span>📖</span> Capa dura premium
                </span>
                <span className="bg-[#FFFDF9] border border-gold/25 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-primary flex items-center gap-1.5 shadow-sm">
                  <span>🇧🇷</span> Frete para todo Brasil
                </span>
              </div>
            </div>

            {/* Espaçador para deixar o lado direito livre para a animação do background */}
            <div 
              className="hidden lg:block h-[450px] pointer-events-none animate-fade-up"
              style={{ animationDelay: "600ms", animationFillMode: "both" }}
            />
          </div>
        </div>
      </section>

      {/* 2. 3 BENEFITS SECTION (Sitting over/under hero) */}
      <section className="py-6 relative z-10 bg-cream reveal-on-scroll">
        <div className="container mx-auto px-4">
          
          {/* Desktop Version (Image 2 style) */}
          <div className="hidden lg:grid bg-white rounded-[32px] shadow-premium border border-cream-deep/30 p-8 md:p-10 max-w-5xl mx-auto grid-cols-3 gap-8">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-3 p-4 group">
                <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-cream-deep/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  {b.icon}
                </div>
                <h3 className="font-serif text-lg text-primary font-semibold transition-colors duration-300 group-hover:text-gold">{b.title}</h3>
                <p className="text-xs text-dark/65 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>

          {/* Mobile Version (Image 1 style) */}
          <div className="grid lg:hidden bg-white rounded-[24px] shadow-premium border border-cream-deep/30 p-6 max-w-md mx-auto grid-cols-1 gap-6">
            {MOBILE_BENEFITS.map((b, i) => (
              <div key={i} className="flex items-start gap-4 p-2 group">
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-xl shrink-0 select-none group-hover:scale-105 transition-transform duration-300">
                  {b.icon}
                </div>
                <div className="space-y-1 text-left">
                  <h3 className="font-serif text-base font-bold text-primary">{b.title}</h3>
                  <p className="text-xs text-dark/65 leading-relaxed">{b.text}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. FEATURED BOOK SECTION ("Livro em Destaque") */}
      <section className="py-24 bg-cream reveal-on-scroll">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 items-center max-w-5xl mx-auto">
            {/* Book standing mockup (Interactive 3D Flip) */}
            <div className="flex justify-center relative w-full overflow-visible">
              {/* Botanical leaves details */}
              <div className="absolute -left-10 top-0 text-5xl opacity-15 pointer-events-none select-none">🍃</div>
              <div className="absolute -right-10 bottom-0 text-5xl opacity-15 pointer-events-none select-none">🌿</div>
              
              <InteractiveBook />
            </div>

            {/* Description details */}
            <div className="space-y-6 max-w-lg">
              <span className="font-body text-xs font-bold text-gold uppercase tracking-[0.18em]">Livro em destaque</span>
              <h2 className="font-serif text-4xl text-primary font-semibold">Bernardo e a Aventura com Dinossauros</h2>
              <p className="text-sm text-dark/70 leading-relaxed font-sans">
                Uma viagem emocionante de volta no tempo onde o pequeno Bernardo explora a era pré-histórica, faz amizade com dinossauros gigantes e vive grandes descobertas. Ilustrações lúdicas e ricas em detalhes emocionais adaptadas à foto da criança.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="bg-white/60 p-3 rounded-2xl border border-cream-deep/40 text-center shadow-sm">
                  <span className="block text-lg select-none">📖</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mt-1">Capa dura</span>
                </div>
                <div className="bg-white/60 p-3 rounded-2xl border border-cream-deep/40 text-center shadow-sm">
                  <span className="block text-lg select-none">🎨</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mt-1">Arte por IA</span>
                </div>
                <div className="bg-white/60 p-3 rounded-2xl border border-cream-deep/40 text-center shadow-sm">
                  <span className="block text-lg select-none">✨</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mt-1">Exclusivo</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  href={settings.primaryCtaHref}
                  className="bg-primary text-cream hover:bg-primary-light hover:scale-105 active:scale-95 px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-md transition-all duration-300"
                >
                  <span>Ver todos os temas</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMO FUNCIONA (TIMELINE) */}
      <section id="como-funciona" className="py-24 bg-cream-light reveal-on-scroll">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-body text-xs font-bold text-gold uppercase tracking-[0.18em]">Como funciona</span>
            <h2 className="font-serif text-3xl md:text-4xl text-primary mt-2">Criar o livro é simples e mágico</h2>
            {/* Elegant gold divider with star */}
            <div className="flex items-center justify-center gap-4 mt-4 select-none">
              <div className="w-12 h-0.5 bg-gold/40" />
              <span className="text-gold text-xs">✦</span>
              <div className="w-12 h-0.5 bg-gold/40" />
            </div>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Curved timeline connector line */}
            <div className="hidden lg:block absolute top-[6px] left-[12.5%] right-[12.5%] h-[112px] pointer-events-none select-none z-0">
              <svg width="100%" height="100%" viewBox="0 0 1000 112" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 0 56 Q 166.5 110 333.3 56 Q 500 110 666.6 56 Q 833.3 110 1000 56"
                  stroke="#D4A843"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  opacity="0.35"
                />
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {HOW_STEPS.map((step) => (
                <div key={step.n} className="flex flex-col items-center text-center space-y-5 relative z-10 group">
                  {/* Circle Badge */}
                  <div className="w-28 h-28 rounded-full bg-white shadow-sm flex items-center justify-center border border-gold/15 group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                    {step.icon}
                  </div>
                  
                  {/* Step Title Row */}
                  <div className="flex items-center gap-2 justify-center">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-sans text-xs font-bold shrink-0">
                      {step.n}
                    </span>
                    <h3 className="font-serif text-base font-bold text-primary">
                      {step.title}
                    </h3>
                  </div>

                  {/* Step Description */}
                  <p className="text-xs sm:text-[13px] text-dark/70 leading-relaxed max-w-[200px] mx-auto">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY US SECTION ("Por que escolher") */}
      <section className="py-12 md:py-16 bg-cream reveal-on-scroll">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-primary mt-2">Por que escolher o Livro da Sua História?</h2>
            {/* Divider with central gold diamond */}
            <div className="flex items-center justify-center gap-2 mt-4 select-none">
              <div className="w-10 h-0.5 bg-gradient-to-r from-transparent to-gold/60" />
              <span className="text-gold text-[10px]">◆</span>
              <div className="w-10 h-0.5 bg-gradient-to-l from-transparent to-gold/60" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 max-w-5xl mx-auto">
            {WHY_US.map((item, i) => (
              <div
                key={i}
                className="bg-[#FCFAF7]/95 border border-gold/15 rounded-[20px] p-5 shadow-sm hover:shadow-md hover:border-gold/35 transition-all duration-300 flex flex-col items-center text-center space-y-3"
              >
                {/* Custom icon inside rounded circle with category specific BG color */}
                <div className={`w-12 h-12 rounded-full ${WHY_US_BG[i]} flex items-center justify-center flex-shrink-0 select-none transition-transform duration-300 hover:scale-110`}>
                  {WHY_US_ICONS[i]}
                </div>
                
                <h3 className="font-serif text-xs md:text-sm font-bold text-primary leading-tight mt-1">
                  {item.title}
                </h3>
                
                <p className="text-[11px] text-dark/70 leading-relaxed font-body max-w-[160px]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. NOSSOS PRODUTOS (5 CARDS) */}
      <section id="produtos" className="py-16 md:py-20 bg-rose reveal-on-scroll">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-body text-xs font-bold text-gold uppercase tracking-[0.18em]">Catálogo</span>
            <h2 className="font-serif text-2xl md:text-3xl text-primary mt-2 font-medium">Nossos Produtos</h2>
            {/* Divider with central gold diamond */}
            <div className="flex items-center justify-center gap-2 mt-3 select-none">
              <div className="w-10 h-0.5 bg-gradient-to-r from-transparent to-gold/60" />
              <span className="text-gold text-[10px]">◆</span>
              <div className="w-10 h-0.5 bg-gradient-to-l from-transparent to-gold/60" />
            </div>
            <p className="text-xs text-dark/60 mt-3 font-body">
              Monte o combo perfeito: adicionais ganham <strong className="text-gold font-bold">R$ 15 de desconto</strong> quando comprados junto com o livro físico capa dura.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 max-w-7xl mx-auto">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-[24px] border border-cream-deep/20 shadow-premium p-4 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group"
              >
                <div>
                  {/* Product Mockup Image Container */}
                  <div className="relative w-full aspect-[4/3] bg-cream/35 rounded-xl overflow-hidden mb-3 flex items-center justify-center p-1.5 group-hover:scale-[1.01] transition-transform duration-500">
                    <Image
                      src={PRODUCT_MOCKUPS[p.type] ?? "/book_cover.png"}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 200px"
                    />
                  </div>

                  {/* Badges & Name */}
                  <div className="text-center">
                    <span className="bg-gold/10 border border-gold/25 px-2 py-0.5 rounded-full text-[8px] font-bold text-gold uppercase tracking-wider mb-1.5 inline-block">
                      {PRODUCT_BADGES[p.type] ?? "Adicional"}
                    </span>
                    <h3 className="font-serif text-sm font-bold text-primary leading-tight group-hover:text-gold transition-colors duration-300 truncate">
                      {p.name}
                    </h3>
                  </div>

                  {/* Bullet features list */}
                  <ul className="text-[10px] text-dark/70 space-y-1 py-3 border-t border-cream-deep/15 text-left font-body mt-3">
                    {(PRODUCT_FEATURES[p.type] ?? []).map((f, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-gold font-bold flex-shrink-0">✓</span>
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Price and Actions */}
                <div className="mt-3 pt-3 border-t border-cream-deep/20 flex flex-col space-y-3">
                  {/* Pricing Comparison */}
                  <div className="flex flex-col text-center font-body">
                    {p.type !== "LIVRO_PRINCIPAL" ? (
                      <>
                        <span className="text-[8px] text-dark/40 uppercase tracking-wider block font-bold">Combo / Avulso</span>
                        <div className="flex items-baseline justify-center gap-1.5">
                          <span className="text-sm font-bold text-primary">
                            {formatBRL(Number(p.price) - 15)}
                          </span>
                          <span className="text-[10px] text-dark/35 line-through">
                            {formatBRL(Number(p.price))}
                          </span>
                        </div>
                        <span className="text-[8px] text-emerald-600 font-semibold block mt-0.5">
                          R$ 15 de desconto acumulado
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[8px] text-dark/40 uppercase tracking-wider block font-bold">Preço Especial</span>
                        <div className="flex items-baseline justify-center gap-1.5">
                          {p.priceOld && (
                            <span className="text-[10px] text-dark/35 line-through">
                              {formatBRL(Number(p.priceOld))}
                            </span>
                          )}
                          <span className="text-sm font-bold text-primary">
                            {formatBRL(Number(p.price))}
                          </span>
                        </div>
                        <span className="text-[8px] text-emerald-600 font-semibold block mt-0.5">
                          6x sem juros no cartão
                        </span>
                      </>
                    )}
                  </div>

                  {/* Add To Cart or Customize CTA Button */}
                  {p.type === "LIVRO_PRINCIPAL" ? (
                    <Link
                      href="/personalizar"
                      className="w-full bg-primary text-cream hover:bg-primary-light active:scale-95 py-2 rounded-full font-bold uppercase tracking-wider text-[9px] text-center shadow-sm transition-all duration-300 block"
                    >
                      Personalizar Livro
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
                      className="w-full bg-primary text-cream hover:bg-primary-light active:scale-95 py-2 rounded-full font-bold uppercase tracking-wider text-[9px] text-center shadow-sm transition-all duration-300 block"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. DEPOIMENTOS ("Histórias que já viraram memórias") */}
      <section id="depoimentos" className="py-24 bg-cream reveal-on-scroll">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-body text-xs font-bold text-gold uppercase tracking-[0.18em]">Depoimentos</span>
            <h2 className="font-serif text-3xl md:text-4xl text-primary mt-2">Histórias que já viraram memórias</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-[28px] border border-gold/15 p-8 relative shadow-sm hover:shadow-md transition-shadow duration-300 group">
                <span className="absolute top-4 left-6 font-serif text-6xl text-gold/20 select-none">“</span>
                <div className="flex text-gold text-xs gap-1 mb-4 group-hover:scale-105 transition-transform duration-300">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <span key={s}>★</span>
                  ))}
                </div>
                <p className="font-serif text-base text-primary/90 italic leading-relaxed pt-2">
                  {t.quote}
                </p>
                <div className="mt-6 pt-4 border-t border-cream-deep/30 flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">{t.author}</span>
                  <span className="text-dark/45">✓ Cliente Verificado</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA FINAL */}
      <section className="bg-primary text-cream py-24 md:py-32 relative overflow-hidden text-center reveal-on-scroll">
        {/* Animated Magic Stars floating background in Navy */}
        <MagicStars count={30} />
        
        <div className="relative container mx-auto px-4 max-w-2xl z-10">
          <span className="font-body text-xs font-semibold text-gold uppercase tracking-[0.2em] block mb-4">Comece hoje</span>
          <h2 className="font-serif text-4xl md:text-5xl text-cream leading-tight mb-4">
            Pronto para criar o livro da sua família?
          </h2>
          <p className="text-sm md:text-base text-cream/70 leading-relaxed max-w-lg mx-auto mb-10 font-sans">
            Dê o primeiro passo para transformar momentos especiais em uma história para toda a vida. Nosso Wizard leva apenas 5 minutos.
          </p>
          <Link
            href={settings.primaryCtaHref}
            className="bg-gold text-primary hover:bg-gold-light hover:scale-105 active:scale-95 px-10 py-4.5 rounded-full font-bold uppercase tracking-wide text-xs shadow-gold-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
          >
            <span>{settings.primaryCtaLabel}</span>
            <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
