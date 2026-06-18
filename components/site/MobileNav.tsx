"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_ITEMS } from "@/lib/site-config";

type MobileNavProps = {
  siteName: string;
  primaryCtaHref: string;
  primaryCtaLabel: string;
};

export default function MobileNav({
  siteName,
  primaryCtaHref,
  primaryCtaLabel,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Abrir menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="text-primary p-2 -mr-2 hover:text-primary-light transition-colors"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
          className="fixed inset-0 bg-cream z-50 flex flex-col"
        >
          {/* Header do menu mobile */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gold/25">
            <span className="font-serif text-xl text-primary">{siteName}</span>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setIsOpen(false)}
              className="text-primary p-2 -mr-2 hover:text-primary-light transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Links de navegação */}
          <nav className="flex flex-col gap-1 p-6 flex-1" aria-label="Navegação mobile">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="font-serif text-2xl text-primary hover:text-primary-light py-3 border-b border-gold/15 transition-colors last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={primaryCtaHref}
              onClick={() => setIsOpen(false)}
              className="btn-primary-lg mt-6 text-center"
            >
              {primaryCtaLabel}
            </Link>
          </nav>

          {/* Rodapé decorativo */}
          <div className="px-6 py-4 text-center">
            <p className="font-script text-lg text-primary/50">{siteName}</p>
          </div>
        </div>
      )}
    </div>
  );
}
