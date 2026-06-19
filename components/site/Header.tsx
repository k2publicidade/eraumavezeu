import Link from "next/link";
import Image from "next/image";
import { NAV_ITEMS } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/site-content";
import { auth } from "@/lib/auth";
import CartBadge from "./CartBadge";
import MobileNav from "./MobileNav";
import UserMenu from "./UserMenu";

export default async function Header() {
  const settings = await getSiteSettings();
  const session = await auth().catch(() => null);
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";
  const userName = session?.user?.name || "";
  const userEmail = session?.user?.email || "";

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-cream-deep/30 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Logo + nome da marca */}
        <Link
          href="/"
          className="flex items-center gap-3 flex-shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
          aria-label={`${settings.siteName} — página inicial`}
        >
          <Image
            src="/logo.jpeg"
            alt={`Selo circular ${settings.siteName}`}
            width={46}
            height={46}
            className="rounded-full ring-2 ring-gold/40 group-hover:ring-gold/60 transition-all duration-300 shadow-sm"
            priority
          />
          <span className="font-serif text-xl font-semibold tracking-wide text-primary hidden sm:block leading-tight">
            Era Uma Vez, <span className="text-gold font-normal italic">Eu</span>
          </span>
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-dark/80 hover:text-primary transition-colors duration-200 text-xs font-semibold uppercase tracking-[0.1em] relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={settings.primaryCtaHref}
            className="bg-primary text-cream hover:bg-primary-light hover:scale-105 active:scale-95 transition-all duration-300 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] flex items-center gap-2 shadow-md"
          >
            <span>{settings.primaryCtaLabel}</span>
            <span aria-hidden="true" className="text-gold">→</span>
          </Link>
          <CartBadge />
          <UserMenu
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            userName={userName}
            userEmail={userEmail}
          />
        </nav>

        {/* Mobile: carrinho + hambúrguer */}
        <div className="flex items-center gap-2 md:hidden">
          <CartBadge />
          <MobileNav
            siteName={settings.siteName}
            primaryCtaHref={settings.primaryCtaHref}
            primaryCtaLabel={settings.primaryCtaLabel}
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            userName={userName}
            userEmail={userEmail}
          />
        </div>
      </div>
    </header>
  );
}
