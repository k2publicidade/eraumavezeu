import type { Metadata } from "next";
import GalleryFilter from "@/components/site/GalleryFilter";
import { GALLERY_SAMPLES, GALLERY_THEMES } from "@/lib/gallery-data";
import Link from "next/link";
import { Upload, Sparkles, CheckCircle2, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Galeria de Transformações",
  description:
    "Inspire-se com fotos reais e veja como nossa IA, com revisão artística humana, transforma as feições das crianças em ilustrações premium de livros personalizados.",
};

export default function GaleriaPage() {
  return (
    <div className="bg-cream">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 bg-gradient-to-b from-cream-to-white border-b border-cream-deep/20">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8ba88808_1px,transparent_1px),linear-gradient(to_bottom,#8ba88808_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Decorative gold stars */}
        <div className="absolute top-12 left-[10%] text-gold/30 animate-float" style={{ animationDelay: "1s" }}>
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div className="absolute bottom-12 right-[15%] text-gold/30 animate-float" style={{ animationDelay: "3s" }}>
          <Star className="w-6 h-6 fill-current" />
        </div>

        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          <span className="inline-block rounded-full bg-gold/10 border border-gold/20 text-gold-dark text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 mb-6">
            A Mágica da Personalização
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-primary font-bold tracking-tight leading-tight">
            De Fotos Reais a <br className="hidden sm:inline" />
            <span className="text-gold font-normal italic font-script capitalize">Histórias Mágicas</span>
          </h1>
          <p className="mt-6 text-lg text-dark/75 leading-relaxed max-w-2xl mx-auto">
            Veja o &ldquo;Antes&rdquo; e o &ldquo;Depois&rdquo; das crianças. Explore como capturamos traços, sorrisos e a essência de cada pequeno protagonista em ilustrações de altíssima qualidade.
          </p>
          <p className="mt-4 text-xs font-semibold text-dark/50 uppercase tracking-widest flex items-center justify-center gap-2">
            <span>🎨 Estilos Variados</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>📸 Respeito aos Traços</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>🔒 Fotos Protegidas</span>
          </p>
        </div>
      </section>

      {/* FILTER & GALLERY GRID SECTION */}
      <section className="py-16 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          <GalleryFilter
            themes={GALLERY_THEMES}
            samples={GALLERY_SAMPLES}
          />
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 md:py-24 bg-cream-light border-t border-b border-cream-deep/30 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold text-gold-dark uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full border border-gold/15">
              Passo a Passo
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-primary font-bold mt-4 leading-tight">
              Como funciona a nossa transformação artística?
            </h2>
            <p className="text-sm text-dark/60 mt-3">
              Garantimos um resultado fiel e emocionante que une tecnologia de ponta e carinho humano.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 border border-gold/10 shadow-xs relative group hover:shadow-sm transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-6 transition-transform group-hover:scale-105 duration-300">
                <Upload className="w-5 h-5" />
              </div>
              <span className="absolute top-8 right-8 text-4xl font-serif text-gold/10 font-bold select-none">
                01
              </span>
              <h3 className="font-serif text-lg text-primary font-bold mb-3">
                Envio das Fotos
              </h3>
              <p className="text-xs text-dark/70 leading-relaxed">
                Durante a criação do livro, você faz o upload de 1 a 4 fotos nítidas do rosto da criança. Damos dicas simples para tirar a foto perfeita no próprio celular.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 border border-gold/10 shadow-xs relative group hover:shadow-sm transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mb-6 transition-transform group-hover:scale-105 duration-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="absolute top-8 right-8 text-4xl font-serif text-gold/10 font-bold select-none">
                02
              </span>
              <h3 className="font-serif text-lg text-primary font-bold mb-3">
                Geração Estilizada
              </h3>
              <p className="text-xs text-dark/70 leading-relaxed">
                Nossa IA inteligente analisa os traços da criança (como cor dos olhos, formato do rosto, sorriso e cabelo) e gera a ilustração adaptada perfeitamente ao tema escolhido.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 border border-gold/10 shadow-xs relative group hover:shadow-sm transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 transition-transform group-hover:scale-105 duration-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="absolute top-8 right-8 text-4xl font-serif text-gold/10 font-bold select-none">
                03
              </span>
              <h3 className="font-serif text-lg text-primary font-bold mb-3">
                Revisão e Capa Dura
              </h3>
              <p className="text-xs text-dark/70 leading-relaxed">
                Nossa equipe artística revisa cada imagem para garantir que a semelhança e a emoção estejam perfeitas. O livro é impresso em alta gramatura com capa dura premium.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / CONVERSION SECTION */}
      <section className="py-20 md:py-28 bg-cta-premium text-cream relative overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
        
        {/* Glowing backdrop highlights */}
        <div className="absolute top-[-50%] left-[-20%] w-[80%] aspect-square rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute bottom-[-50%] right-[-20%] w-[80%] aspect-square rounded-full bg-forest-light/10 blur-[120px]" />

        <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
          <h2 className="font-serif text-3xl md:text-5xl text-cream font-bold leading-tight">
            Pronto para ver o seu pequeno como <br />
            o herói de sua própria história?
          </h2>
          <p className="mt-6 text-base text-cream/80 max-w-lg mx-auto leading-relaxed">
            Monte o livro personalizado em menos de 10 minutos. Escolha o tema, envie as fotos e crie uma recordação inesquecível para toda a vida.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/personalizar"
              className="bg-gold text-primary hover:bg-gold-light hover:scale-105 active:scale-95 transition-all duration-300 rounded-full py-4 px-10 text-xs font-semibold uppercase tracking-[0.15em] shadow-lg border border-gold-light/20 flex items-center gap-2 group w-full sm:w-auto justify-center"
            >
              <span>Começar Personalização</span>
              <span className="font-bold transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/como-funciona"
              className="bg-transparent text-cream hover:bg-white/5 border border-cream/20 rounded-full py-4 px-8 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 w-full sm:w-auto justify-center"
            >
              Entenda o Processo
            </Link>
          </div>

          <div className="mt-12 pt-10 border-t border-white/10 flex flex-wrap gap-y-4 gap-x-8 justify-center text-xs text-cream/60">
            <span className="flex items-center gap-2">✔ Frete para todo o Brasil</span>
            <span className="flex items-center gap-2">✔ Capa dura e páginas premium</span>
            <span className="flex items-center gap-2">✔ Fotos apagadas em 90 dias (LGPD)</span>
          </div>
        </div>
      </section>
    </div>
  );
}
