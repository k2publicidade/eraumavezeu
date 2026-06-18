import Link from "next/link";
import Image from "next/image";
import { NAV_ITEMS } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/site-content";
import CartBadge from "./CartBadge";
import MobileNav from "./MobileNav";

export default async function Header() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-gold/25 shadow-xs">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo + nome da marca */}
        <Link
          href="/"
          className="flex items-center gap-3 flex-shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
          aria-label={`${settings.siteName} — página inicial`}
        >
          <Image
            src="/logo.jpeg"
            alt={`Selo circular ${settings.siteName}`}
            width={44}
            height={44}
            className="rounded-full ring-2 ring-gold/40 group-hover:ring-gold/70 transition-all duration-250 shadow-sm"
            priority
          />
          <span className="font-serif text-lg text-primary hidden sm:block leading-tight">
            Era Uma Vez<br />
            <span className="text-sm font-normal text-primary/70 font-sans">Livros Personalizados</span>
          </span>
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden md:flex items-center gap-5" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-dark/75 hover:text-primary transition-colors duration-200 text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all after:duration-250 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
          <Link href={settings.primaryCtaHref} className="btn-primary text-sm">
            {settings.primaryCtaLabel}
          </Link>
          <CartBadge />
        </nav>

        {/* Mobile: carrinho + hambúrguer */}
        <div className="flex items-center gap-2 md:hidden">
          <CartBadge />
          <MobileNav
            siteName={settings.siteName}
            primaryCtaHref={settings.primaryCtaHref}
            primaryCtaLabel={settings.primaryCtaLabel}
          />
        </div>
      </div>
    </header>
  );
}
