import type { Metadata } from "next";
import { getFaqItems, getSiteSettings } from "@/lib/site-content";
import FAQInteractive from "@/components/site/FAQInteractive";
import ScrollRevealTrigger from "@/components/effects/ScrollRevealTrigger";
import MagicStars from "@/components/effects/MagicStars";
import FloatingMagicElements from "@/components/effects/FloatingMagicElements";

export const metadata: Metadata = {
  title: "Perguntas Frequentes | Era Uma Vez, Eu",
  description:
    "Dúvidas sobre prazos, personalização, pagamento, envio e segurança das fotos da criança.",
};

export const revalidate = 300;

export default async function FAQPage() {
  const [faqItems, settings] = await Promise.all([getFaqItems(), getSiteSettings()]);

  return (
    <div className="bg-cream min-h-screen relative overflow-hidden pb-16">
      {/* Scroll Reveal Trigger */}
      <ScrollRevealTrigger />

      {/* Background Magic Stars */}
      <MagicStars count={12} />

      {/* Floating Storytelling Magic Icons */}
      <FloatingMagicElements />

      {/* HEADER SECTION */}
      <section className="relative pt-16 pb-10 md:pt-20 md:pb-14 overflow-hidden border-b border-cream-deep/20 text-center">
        <div className="container mx-auto px-4 max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-3 py-1.5 rounded-full">
            <span className="text-[10px] text-primary font-bold uppercase tracking-[0.15em] flex items-center gap-1.5">
              <span>✨</span> Dúvidas Resolvidas <span>✨</span>
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-primary leading-tight tracking-tight">
            Perguntas Frequentes
          </h1>
          <p className="text-sm md:text-base text-dark/70 max-w-xl mx-auto leading-relaxed font-body">
            Encontre respostas rápidas sobre prazos de entrega, envio de fotos, processo de personalização com IA e formas de pagamento.
          </p>
        </div>
      </section>

      {/* INTERACTIVE FAQ SECTION */}
      <section className="py-10 md:py-14 relative z-10">
        <div className="container mx-auto px-4">
          <FAQInteractive items={faqItems} whatsappNumber={settings.whatsappNumber || ""} />
        </div>
      </section>

      {/* NEED HELP FOOTER BANNER */}
      <section className="py-8 relative z-10">
        <div className="container mx-auto px-4 max-w-2xl text-center space-y-4">
          <h3 className="font-serif text-lg font-bold text-primary">Não encontrou sua dúvida?</h3>
          <p className="text-xs text-dark/75 leading-relaxed font-body">
            Nossa equipe de suporte está online para te atender com carinho e resolver qualquer detalhe do seu pedido.
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/${settings.whatsappNumber || ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-cream hover:bg-primary-light active:scale-95 px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs shadow-md transition-all duration-300 inline-flex items-center gap-2"
            >
              <span>Falar com o Suporte</span>
              <span className="text-gold">💬</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
