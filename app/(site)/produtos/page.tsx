import Link from "next/link";
import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/site-content";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ScrollRevealTrigger from "@/components/effects/ScrollRevealTrigger";
import MagicStars from "@/components/effects/MagicStars";
import ProductGallery from "@/components/site/ProductGallery";
import ProductMediaCarousel from "@/components/site/ProductMediaCarousel";
import ComboSimulator from "@/components/site/ComboSimulator";
import FloatingMagicElements from "@/components/effects/FloatingMagicElements";
import { COMBO_DISCOUNT } from "@/lib/cart/types";
import { PRODUCT_SHOWCASE_MEDIA } from "@/lib/gallery-data";

export const metadata: Metadata = {
  title: "Nossos Produtos | Era Uma Vez, Eu",
  description:
    "Descubra nossos livros infantis personalizados de alta qualidade e crie combos mágicos com quebra-cabeças, livros de colorir e adesivos com desconto especial.",
};

export const revalidate = 300;

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const PRODUCT_BADGES: Record<string, string> = {
  EBOOK: "Prático & Digital",
  LIVRO_COLORIR: "Criatividade & Arte",
  QUEBRA_CABECA: "Desafio & Raciocínio",
  CARTELA_ADESIVOS: "Decoração & Diversão",
};

const PRODUCT_BULLETS: Record<string, string[]> = {
  EBOOK: [
    "Acessível em celulares, tablets e computadores",
    "Versão digital em PDF de alta definição",
    "Envio imediato após aprovação da arte",
  ],
  LIVRO_COLORIR: [
    "20 páginas personalizadas com a história",
    "Papel offset encorpado para pintura",
    "Estimula a expressão artística infantil",
  ],
  QUEBRA_CABECA: [
    "60 peças robustas com encaixes precisos",
    "Tamanho A4 (29x21 cm) para toda a família",
    "Material durável com brilho protetor",
  ],
  CARTELA_ADESIVOS: [
    "Cartela A4 com ilustrações exclusivas",
    "Vinil fosco premium, fácil de colar",
    "Personalizado com o rosto e nome do herói",
  ],
};

export default async function ProdutosPage() {
  const [products, settings] = await Promise.all([getActiveProducts(), getSiteSettings()]);

  // Separate the main book from the addons to build an editorial grid hierarchy
  const mainProduct = products.find((p) => p.type === "LIVRO_PRINCIPAL");
  const addonProducts = products.filter((p) => p.type !== "LIVRO_PRINCIPAL");

  return (
    <div className="bg-cream min-h-screen relative overflow-hidden pb-16">
      {/* Scroll Reveal Trigger */}
      <ScrollRevealTrigger />

      {/* Background Magic Stars */}
      <MagicStars count={18} />

      {/* HEADER SECTION */}
      <section className="relative pt-16 pb-10 md:pt-20 md:pb-14 overflow-hidden border-b border-cream-deep/20 text-center">
        {/* Floating Storytelling Magic Icons (stars, moon, book, key) */}
        <FloatingMagicElements />

        <div className="container mx-auto px-4 max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-3 py-1.5 rounded-full">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-primary">
              <span>✨</span> Coleção Premium <span>✨</span>
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-primary leading-tight tracking-tight">
            Nossa Coleção Completa
          </h1>
          <p className="text-sm md:text-base text-dark/70 max-w-2xl mx-auto leading-relaxed font-body">
            Monte o kit perfeito para sua criança. Ganhe <strong className="text-gold-dark font-bold">{formatBRL(COMBO_DISCOUNT)} de desconto</strong> em cada item adicional comprado junto com o livro físico capa dura.
          </p>
        </div>
      </section>

      {/* MAIN PRODUCTS SECTION */}
      <section className="py-10 md:py-14 relative">
        <div className="container mx-auto px-4 max-w-6xl space-y-16">
          
          {/* 1. FEATURED MAIN PRODUCT */}
          {mainProduct && (
            <div className="reveal-on-scroll grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
              {/* Product Image Interactive Gallery */}
              <div className="w-full">
                <ProductGallery />
              </div>

              {/* Product Info */}
              <div className="space-y-4 min-w-0">
                <div className="space-y-2">
                  <span className="block font-body text-xs font-bold uppercase tracking-[0.2em] text-gold">
                    Nosso Campeão de Vendas
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl text-primary leading-tight font-medium">
                    {mainProduct.name}
                  </h2>
                  <p className="text-xs text-dark/70 leading-relaxed font-body">
                    {mainProduct.description}
                  </p>
                </div>

                <div className="border-t border-b border-cream-deep/20 py-4 space-y-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-primary">
                    Destaques de Qualidade:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-dark/85 font-body">
                    <li className="flex items-center gap-2">
                      <span className="text-gold text-xs">✓</span> Capa dura de alta resistência
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold text-xs">✓</span> 20 páginas de história rica
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold text-xs">✓</span> Papel couché de alta gramatura
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold text-xs">✓</span> Formato premium deitado (30x21cm)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold text-xs">✓</span> Revisão humana especializada
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold text-xs">✓</span> Ilustrações ricas em detalhes
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                  <div className="space-y-0.5 font-body">
                    <span className="block text-xs font-bold uppercase tracking-wider text-dark/65">Preço Especial</span>
                    <div className="flex items-baseline gap-2">
                      {mainProduct.priceOld && (
                        <span className="text-xs text-dark/35 line-through">
                          {formatBRL(mainProduct.priceOld)}
                        </span>
                      )}
                      <span className="font-serif text-2xl font-bold text-primary">
                        {formatBRL(mainProduct.price)}
                      </span>
                    </div>
                    <span className="block text-xs font-semibold text-emerald-700">
                      Ou até 6x sem juros no cartão
                    </span>
                  </div>
                  
                  <Link
                    href="/personalizar"
                    className="w-full sm:w-auto bg-primary text-cream hover:bg-primary-light active:scale-95 text-center px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-[11px] shadow-premium hover:shadow-xl transition-all duration-300"
                  >
                    Personalizar este livro →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 2. COMBO SIMULATOR CALLOUT */}
          <div className="reveal-on-scroll py-4">
            <ComboSimulator products={products} />
          </div>

          {/* 3. ADDON PRODUCTS GRID */}
          <div id="produtos-adicionais" className="scroll-mt-24 space-y-8">
            <div className="text-center space-y-1">
              <span className="block text-xs font-bold uppercase tracking-[0.2em] text-gold">
                Completando a Magia
              </span>
              <h3 className="font-serif text-2xl md:text-3xl text-primary font-medium">
                Adicionais Personalizados
              </h3>
              <p className="text-xs text-dark/65 max-w-lg mx-auto font-body">
                Deixe o presente ainda mais inesquecível adicionando brincadeiras e lembranças extras com desconto especial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addonProducts.map((p) => {
                const showcaseImages = PRODUCT_SHOWCASE_MEDIA[p.type];

                return (
                <div
                  key={p.id}
                  className="reveal-on-scroll group flex flex-col gap-5 rounded-2xl bg-white p-4 ring-1 ring-primary/10 transition-colors duration-300 hover:ring-gold/50 sm:p-5 lg:flex-row"
                >
                  <ProductMediaCarousel
                    images={showcaseImages.length > 0 ? showcaseImages : p.images}
                    productName={p.name}
                    showThumbnails
                    className="mx-auto w-full max-w-[250px] flex-none lg:w-[190px]"
                  />

                  {/* Info Column */}
                  <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-gold/10 border border-gold/25 px-2 py-0.5 rounded-full text-xs font-bold text-gold uppercase tracking-wider">
                          {PRODUCT_BADGES[p.type] ?? "Adicional"}
                        </span>
                        {p.type === "EBOOK" ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50">
                            Grátis no Combo
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50">
                            - {formatBRL(COMBO_DISCOUNT)} no Combo
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif text-lg font-bold text-primary group-hover:text-gold transition-colors duration-300 truncate">
                        {p.name}
                      </h4>

                      <p className="text-sm text-dark/70 leading-relaxed font-body">
                        {p.description}
                      </p>

                      {/* Key bullet features */}
                      <ul className="space-y-1 pt-1.5 border-t border-cream-deep/15 font-body">
                        {(PRODUCT_BULLETS[p.type] ?? []).map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-1 text-xs text-dark/75">
                            <span className="text-gold font-bold">✓</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-cream-deep/20 flex items-center justify-between gap-3">
                      <div className="flex flex-col font-body">
                        <span className="text-xs text-dark/65 uppercase tracking-wider block font-bold">
                          {p.type === "EBOOK" ? "No Combo / Avulso" : "Combo / Avulso"}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-serif text-base font-bold text-primary">
                            {p.type === "EBOOK" ? "Grátis" : formatBRL(Math.max(p.price - COMBO_DISCOUNT, 0))}
                          </span>
                          <span className="text-xs text-dark/55 line-through">
                            {formatBRL(p.price)}
                          </span>
                        </div>
                      </div>

                      <AddToCartButton
                        product={{
                          id: p.id,
                          slug: p.slug,
                          name: p.name,
                          type: p.type,
                          price: p.price,
                        }}
                        className="min-h-11 rounded-full bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-cream shadow-sm transition-all duration-300 hover:bg-primary-light hover:shadow-md active:scale-[0.98]"
                      />
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* 4. PREMIUM QUALITY BANNER (TRUST BUILDER) */}
          <div className="reveal-on-scroll bg-[#1B2A4A] rounded-[24px] p-6 md:p-8 text-cream relative overflow-hidden border border-white/10 shadow-premium">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(#FAF7F2_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-gold/15 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-center">
              <div className="space-y-3">
                <span className="block text-xs font-bold uppercase tracking-[0.25em] text-gold">
                  Qualidade Garantida
                </span>
                <h4 className="font-serif text-2xl md:text-3xl text-cream font-medium leading-tight">
                  Feito para durar por gerações
                </h4>
                <p className="text-xs text-cream/70 leading-relaxed font-body max-w-md">
                  Nossos livros são impressos em equipamentos de ponta utilizando tintas atóxicas ecológicas e encadernação costurada reforçada de capa dura, ideal para o manuseio infantil.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6 font-body">
                <div className="space-y-1">
                  <h5 className="font-serif text-xs font-bold text-gold">Impressão Premium</h5>
                  <p className="text-xs text-cream/75 leading-normal">
                    Cores vibrantes em papel couché importado fosco (170g).
                  </p>
                </div>
                
                <div className="space-y-1">
                  <h5 className="font-serif text-xs font-bold text-gold">Laminado Antirrisco</h5>
                  <p className="text-xs text-cream/75 leading-normal">
                    Película protetora que resiste a dedinhos sujos e pequenos acidentes.
                  </p>
                </div>

                <div className="space-y-1">
                  <h5 className="font-serif text-xs font-bold text-gold">Encadernação Forte</h5>
                  <p className="text-xs text-cream/75 leading-normal">
                    Páginas costuradas e coladas para impedir folhas soltas.
                  </p>
                </div>

                <div className="space-y-1">
                  <h5 className="font-serif text-xs font-bold text-gold">Envio Protegido</h5>
                  <p className="text-xs text-cream/75 leading-normal">
                    Embalagem rígida especial para garantir entrega perfeita.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
