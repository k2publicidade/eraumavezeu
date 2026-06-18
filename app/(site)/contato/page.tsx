import type { Metadata } from "next";
import {
  buildWhatsappHref,
  getSiteSettings,
  socialLinksFromSettings,
} from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a gente por WhatsApp ou e-mail. Tempo médio de resposta: até 1h em horário comercial.",
};

export default async function ContatoPage() {
  const settings = await getSiteSettings();
  const socialLinks = socialLinksFromSettings(settings);

  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-to-b from-light to-primary/5">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-dark">
            Fale com a gente
          </h1>
          <p className="mt-4 text-lg text-dark/70">{settings.contactResponseTime}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href={buildWhatsappHref(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white rounded-2xl p-8 flex flex-col items-center text-center hover:opacity-90 transition"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.52 3.48A11.88 11.88 0 0 0 12.06 0C5.52 0 .2 5.32.2 11.86c0 2.09.55 4.13 1.59 5.93L0 24l6.39-1.68a11.83 11.83 0 0 0 5.67 1.45h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.15-3.41-8.43z" />
              </svg>
              <h2 className="mt-4 font-serif text-2xl">WhatsApp</h2>
              <p className="mt-2 text-white/90 text-sm">{settings.whatsappDisplay}</p>
              <p className="mt-1 text-white/80 text-xs">
                Resposta rápida, tira dúvida e acompanha pedido
              </p>
            </a>

            <a
              href={`mailto:${settings.contactEmail}`}
              className="bg-white border border-primary/20 rounded-2xl p-8 flex flex-col items-center text-center hover:border-primary transition"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
                aria-hidden="true"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <h2 className="mt-4 font-serif text-2xl text-dark">E-mail</h2>
              <p className="mt-2 text-dark/70 text-sm">{settings.contactEmail}</p>
            </a>
          </div>

          <div className="mt-12 bg-white rounded-2xl p-8 border border-primary/10">
            <h2 className="font-serif text-xl text-dark">Redes sociais</h2>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {socialLinks.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark underline"
                  >
                    {social.platform === "instagram" ? "Instagram" : "TikTok"}: {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 bg-white rounded-2xl p-8 border border-primary/10">
            <h2 className="font-serif text-xl text-dark">
              Dúvida frequente antes de comprar?
            </h2>
            <p className="mt-2 text-dark/70">
              A maioria das perguntas (prazo, frete, fotos, pagamento) já está respondida na
              página{" "}
              <a href="/faq" className="text-primary hover:text-primary-dark underline">
                FAQ
              </a>
              .
            </p>
            <p className="mt-4 text-dark/50 text-sm">CNPJ {settings.cnpj}</p>
          </div>
        </div>
      </section>
    </>
  );
}
