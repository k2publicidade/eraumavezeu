import Link from "next/link";
import {
  buildWhatsappHref,
  getSiteSettings,
  socialLinksFromSettings,
} from "@/lib/site-content";

export default async function Footer() {
  const settings = await getSiteSettings();
  const socialLinks = socialLinksFromSettings(settings);

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
              {settings.siteName}
            </h3>
            <p className="text-cream/65 text-sm leading-relaxed mt-3">
              {settings.siteTagline}
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
              {[
                { label: "Início", href: "/" },
                { label: "Como Funciona", href: "/como-funciona" },
                { label: "Produtos", href: "/produtos" },
                { label: "Para Todas Ocasiões", href: "/para-todas-ocasioes" },
                { label: "Galeria", href: "/galeria" },
                { label: "FAQ", href: "/faq" },
                { label: "Contato", href: "/contato" },
              ].map((item) => (
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
                  href={buildWhatsappHref(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/65 hover:text-gold-warm transition-colors duration-200"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-cream/65 hover:text-gold-warm transition-colors duration-200"
                >
                  {settings.contactEmail}
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
              {socialLinks.map((social) => (
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
            © {new Date().getFullYear()} {settings.siteName}. Todos os direitos
            reservados. CNPJ {settings.cnpj}.
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
