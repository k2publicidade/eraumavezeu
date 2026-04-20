import Link from "next/link";
import { NAV_ITEMS, PRIMARY_CTA, SITE_NAME } from "@/lib/site-config";
import MobileNav from "./MobileNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-light/95 backdrop-blur border-b border-primary/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-2xl text-primary whitespace-nowrap"
        >
          {SITE_NAME}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-dark/80 hover:text-primary transition text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={PRIMARY_CTA.href}
            className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition text-sm font-medium"
          >
            {PRIMARY_CTA.label}
          </Link>
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}
