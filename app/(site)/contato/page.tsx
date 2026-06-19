import type { Metadata } from "next";
import {
  buildWhatsappHref,
  getSiteSettings,
  socialLinksFromSettings,
} from "@/lib/site-content";
import ContactForm from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a gente por WhatsApp ou e-mail. Tempo médio de resposta: até 1h em horário comercial.",
};

export default async function ContatoPage() {
  const settings = await getSiteSettings();
  const socialLinks = socialLinksFromSettings(settings);

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero Header Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#FCFAF7] to-[#FAF7F2] border-b border-gold/15">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <span className="font-body text-xs font-semibold text-gold uppercase tracking-[0.2em] block mb-3">
            Fale Conosco
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-primary font-semibold leading-tight">
            Estamos aqui para ajudar
          </h1>
          <p className="mt-4 text-base text-dark/70 max-w-lg mx-auto leading-relaxed">
            {settings.contactResponseTime || "Fale com a gente por WhatsApp, e-mail ou enviando o formulário abaixo."}
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 items-start">
            
            {/* Left Column: Direct Contact Info */}
            <div className="space-y-6">
              
              {/* WhatsApp Card */}
              <a
                href={buildWhatsappHref(settings)}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#25D366] text-white rounded-3xl p-6 hover:shadow-lg active:scale-[0.98] transition-all duration-300 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl shrink-0">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M20.52 3.48A11.88 11.88 0 0 0 12.06 0C5.52 0 .2 5.32.2 11.86c0 2.09.55 4.13 1.59 5.93L0 24l6.39-1.68a11.83 11.83 0 0 0 5.67 1.45h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.15-3.41-8.43z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-semibold">Atendimento via WhatsApp</h2>
                    <p className="mt-1 text-white/95 text-sm font-semibold">{settings.whatsappDisplay}</p>
                    <p className="mt-2 text-white/85 text-xs leading-relaxed">
                      Resposta rápida para dúvidas sobre personalização, prazos ou para acompanhar um pedido em andamento.
                    </p>
                  </div>
                </div>
              </a>

              {/* Email Card */}
              <a
                href={`mailto:${settings.contactEmail}`}
                className="block bg-white border border-gold/25 rounded-3xl p-6 hover:border-gold/50 hover:shadow-sm transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-cream p-3 rounded-2xl text-primary shrink-0 border border-gold/15">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-primary font-semibold">Envie um e-mail</h2>
                    <p className="mt-1 text-dark/80 text-sm font-medium">{settings.contactEmail}</p>
                    <p className="mt-2 text-dark/60 text-xs leading-relaxed">
                      Ideal para solicitações formais, parcerias, orçamentos corporativos ou suporte detalhado.
                    </p>
                  </div>
                </div>
              </a>

              {/* Social Media Card */}
              <div className="bg-white border border-gold/20 rounded-3xl p-6 shadow-sm">
                <h3 className="font-serif text-lg text-primary font-semibold">Redes Sociais</h3>
                <p className="text-xs text-dark/50 mt-1">Acompanhe nossas novidades e lançamentos:</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {socialLinks.map((social) => (
                    <li key={social.platform} className="flex items-center gap-2">
                      <span className="text-xs select-none">✦</span>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary font-semibold hover:text-fox hover:underline transition duration-200"
                      >
                        {social.platform === "instagram" ? "Instagram" : "TikTok"}: <span className="font-normal text-dark/70">{social.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQ and CNPJ Details */}
              <div className="bg-white/60 border border-gold/15 rounded-3xl p-6 space-y-4">
                <div>
                  <h3 className="font-serif text-base text-primary font-semibold">
                    Dúvida antes de comprar?
                  </h3>
                  <p className="mt-2 text-xs text-dark/70 leading-relaxed">
                    Você pode encontrar respostas rápidas sobre prazo de entrega, frete, envio de fotos e formas de pagamento na nossa página de{" "}
                    <a href="/faq" className="text-primary font-bold hover:underline">
                      FAQ (Dúvidas Frequentes)
                    </a>
                    .
                  </p>
                </div>
                <div className="pt-4 border-t border-cream-deep/40 text-[11px] text-dark/45">
                  <p>Controlador de Dados: Era Uma Vez Eu</p>
                  <p className="mt-0.5">CNPJ: {settings.cnpj}</p>
                </div>
              </div>

            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:sticky lg:top-28">
              <ContactForm />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
