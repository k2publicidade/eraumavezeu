import type { Metadata } from "next";
import { getFaqItems } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Perguntas Frequentes",
  description:
    "Dúvidas sobre prazos, personalização, pagamento, envio e segurança das fotos da criança.",
};

export default async function FAQPage() {
  const faqItems = await getFaqItems();

  return (
    <>
      <section className="py-16 md:py-24 bg-hero-warm">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-primary">
            Perguntas Frequentes
          </h1>
          <p className="mt-4 text-lg text-dark/60">
            Não achou sua dúvida? <span className="text-fox font-medium">Chama no WhatsApp.</span>
          </p>
        </div>
      </section>

      <section className="py-16 bg-cream-warm">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-2">
            {faqItems.map((item) => (
              <details
                key={item.id}
                className="group bg-cream-light rounded-2xl border border-gold/25 overflow-hidden hover:border-gold/45 transition-colors duration-200"
              >
                <summary className="cursor-pointer px-6 py-4 font-serif text-lg text-primary flex items-center justify-between list-none gap-4 hover:bg-gold/5 transition-colors duration-200">
                  <span>{item.question}</span>
                  <span
                    className="text-gold text-2xl flex-shrink-0 group-open:rotate-45 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-dark/70 leading-relaxed border-t border-gold/15 pt-4">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
