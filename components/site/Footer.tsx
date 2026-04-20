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
    <footer className="bg-dark text-light mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-2xl text-primary mb-3">
              {SITE_NAME}
            </h3>
            <p className="text-light/70 text-sm leading-relaxed">
              {SITE_TAGLINE}
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-3">Navegação</h4>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-light/70 hover:text-primary transition text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-3">Atendimento</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={whatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light/70 hover:text-primary transition"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-light/70 hover:text-primary transition"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-3">Redes</h4>
            <ul className="space-y-2 text-sm">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-light/70 hover:text-primary transition"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-light/10 mt-8 pt-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-light/60">
          <span>
            © {new Date().getFullYear()} {SITE_NAME}. Todos os direitos
            reservados.
          </span>
          <Link
            href="/privacidade"
            className="hover:text-primary transition"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
