import Link from "next/link";
import {
  CONTACT_EMAIL,
  NAV_ITEMS,
  SITE_NAME,
  SITE_TAGLINE,
  SOCIAL_LINKS,
  WHATSAPP_MESSAGE_DEFAULT,
  WHATSAPP_NUMBER,
} from "@/lib/site-config";

function whatsappHref() {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE_DEFAULT,
  )}`;
}

export default function Footer() {
  return (
    <footer className="bg-primary text-cream mt-auto">
      {/* Faixa dourada decorativa no topo do footer */}
      <div className="h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-warm" aria-hidden="true" />

      <div className="container mx-auto px-4 py-14">
        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Coluna da marca */}
          <div className="md:col-span-1">
            <h3 className="font-serif text-2xl text-gold-warm mb-1">
              {SITE_NAME}
            </h3>
            <p className="text-cream/65 text-sm leading-relaxed mt-3">
              {SITE_TAGLINE}
            </p>
            {/* Estrelinhas decorativas */}
            <div className="mt-5 flex gap-1 text-gold/50 text-xs select-none" aria-hidden="true">
              ✦ ✦ ✦
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="font-serif text-base text-gold-warm mb-4 uppercase tracking-wide text-xs">
              Navegação
            </h4>
            <ul className="space-y-2.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream/65 hover:text-gold-warm transition-colors duration-200 text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h4 className="font-serif text-base text-gold-warm mb-4 uppercase tracking-wide text-xs">
              Atendimento
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={whatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/65 hover:text-gold-warm transition-colors duration-200"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-cream/65 hover:text-gold-warm transition-colors duration-200"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          {/* Redes sociais */}
          <div>
            <h4 className="font-serif text-base text-gold-warm mb-4 uppercase tracking-wide text-xs">
              Redes
            </h4>
            <ul className="space-y-2.5 text-sm">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cream/65 hover:text-gold-warm transition-colors duration-200"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rodapé inferior */}
        <div className="border-t border-cream/10 mt-10 pt-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-cream/45">
          <span>
            © {new Date().getFullYear()} {SITE_NAME}. Todos os direitos reservados.
          </span>
          <Link
            href="/privacidade"
            className="hover:text-gold-warm transition-colors duration-200"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
