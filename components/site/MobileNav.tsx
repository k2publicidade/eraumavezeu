"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { NAV_ITEMS } from "@/lib/site-config";

type MobileNavProps = {
  siteName: string;
  primaryCtaHref: string;
  primaryCtaLabel: string;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userName?: string;
  userEmail?: string;
};

export default function MobileNav({
  siteName,
  primaryCtaHref,
  primaryCtaLabel,
  isLoggedIn = false,
  isAdmin = false,
  userName = "",
  userEmail = "",
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
          className="fixed inset-0 bg-cream z-50 flex flex-col overflow-y-auto"
        >
          {/* Header do menu mobile */}
          <div className="flex items-center justify-between px-4 h-20 border-b border-gold/25 shrink-0">
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
          <nav className="flex flex-col gap-1 p-6 flex-grow" aria-label="Navegação mobile">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="font-serif text-lg text-primary hover:text-primary-light py-2.5 border-b border-gold/15 transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="font-serif text-lg text-gold hover:text-gold-dark py-2.5 border-b border-gold/15 transition-colors flex items-center gap-2"
                  >
                    <span>📊</span> Painel Administrativo
                  </Link>
                )}
                <Link
                  href="/pedidos"
                  onClick={() => setIsOpen(false)}
                  className="font-serif text-lg text-primary hover:text-primary-light py-2.5 border-b border-gold/15 transition-colors flex items-center gap-2"
                >
                  <span>🧾</span> Meus Pedidos
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="font-serif text-lg text-red-600 hover:text-red-800 py-2.5 border-b border-gold/15 transition-colors text-left flex items-center gap-2"
                >
                  <span>🚪</span> Sair da Conta
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="font-serif text-lg text-primary hover:text-primary-light py-2.5 border-b border-gold/15 transition-colors flex items-center gap-2"
              >
                <span>🔑</span> Entrar na Conta
              </Link>
            )}

            <Link
              href={primaryCtaHref}
              onClick={() => setIsOpen(false)}
              className="btn-primary-lg mt-6 text-center"
            >
              {primaryCtaLabel}
            </Link>
          </nav>

          {/* Rodapé decorativo */}
          <div className="px-6 py-4 text-center shrink-0 border-t border-gold/10">
            {isLoggedIn && (
              <p className="text-xs text-dark/50 mb-2 truncate">
                Conectado como <strong className="text-primary">{userName || userEmail}</strong>
              </p>
            )}
            <p className="font-script text-lg text-primary/50">{siteName}</p>
          </div>
        </div>
      )}
    </div>
  );
}
