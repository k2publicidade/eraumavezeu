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
    <footer className="bg-primary text-cream mt-auto border-t border-cream-deep/10">
      {/* Decorative stars / line at the top */}
      <div className="h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-warm" aria-hidden="true" />

      <div className="container mx-auto px-4 py-16">
        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Coluna da marca */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-semibold tracking-wide text-cream">
              Era Uma Vez, <span className="text-gold italic font-normal">Eu</span>
            </h3>
            <p className="text-cream/70 text-sm leading-relaxed max-w-sm">
              {settings.siteTagline}
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cream/70 hover:text-gold hover:border-gold hover:bg-white/10 transition-all duration-300"
                  aria-label={social.label}
                >
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider">
                    {social.platform === "instagram" ? "IG" : "TK"}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Navegação */}
          <div className="space-y-5">
            <h4 className="font-body text-xs font-semibold text-gold uppercase tracking-[0.18em]">
              Navegação
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Início", href: "/" },
                { label: "Como Funciona", href: "/como-funciona" },
                { label: "Produtos", href: "/produtos" },
                { label: "Para Todas Ocasiões", href: "/para-todas-ocasioes" },
                { label: "Galeria", href: "/galeria" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream/70 hover:text-gold transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ajuda & Contato */}
          <div className="space-y-5">
            <h4 className="font-body text-xs font-semibold text-gold uppercase tracking-[0.18em]">
              Ajuda & Contato
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/faq" className="text-cream/70 hover:text-gold transition-colors duration-200">Perguntas Frequentes (FAQ)</Link></li>
              <li><Link href="/contato" className="text-cream/70 hover:text-gold transition-colors duration-200">Fale Conosco</Link></li>
              <li>
                <a
                  href={buildWhatsappHref(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/70 hover:text-gold transition-colors duration-200 flex items-center gap-1.5"
                >
                  <span>WhatsApp:</span>
                  <span className="font-medium text-gold">{settings.whatsappDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-cream/70 hover:text-gold transition-colors duration-200 break-all"
                >
                  {settings.contactEmail}
                </a>
              </li>
            </ul>
          </div>

          {/* Pagamento & Segurança */}
          <div className="space-y-5">
            <h4 className="font-body text-xs font-semibold text-gold uppercase tracking-[0.18em]">
              Segurança & Pagamento
            </h4>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-cream/80">Visa</span>
                <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-cream/80">Mastercard</span>
                <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-cream/80">Elo</span>
                <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-cream/80 font-mono text-gold">Pix</span>
              </div>
              <div className="flex items-center gap-3 bg-forest/10 border border-forest/20 p-3 rounded-2xl max-w-xs">
                <span className="text-2xl" aria-hidden="true">🛡️</span>
                <p className="text-xs text-cream/70 leading-normal">
                  Ambiente seguro criptografado com certificado SSL padrão bancário.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé inferior */}
        <div className="border-t border-cream/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-cream/50">
          <span>
            © {new Date().getFullYear()} {settings.siteName}. Todos os direitos
            reservados. CNPJ {settings.cnpj}.
          </span>
          <div className="flex gap-6">
            <Link
              href="/privacidade"
              className="hover:text-gold transition-colors duration-200"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/termos"
              className="hover:text-gold transition-colors duration-200"
            >
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
