"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_ITEMS, PRIMARY_CTA, SITE_NAME } from "@/lib/site-config";

export default function MobileNav() {
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
        className="text-dark p-2 -mr-2"
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
          className="fixed inset-0 bg-light z-50 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 h-16 border-b border-primary/10">
            <span className="font-serif text-2xl text-primary">{SITE_NAME}</span>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setIsOpen(false)}
              className="text-dark p-2 -mr-2"
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
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-6 p-6 text-xl font-serif">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-dark hover:text-primary transition"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={PRIMARY_CTA.href}
              onClick={() => setIsOpen(false)}
              className="mt-4 bg-primary text-white px-6 py-3 rounded-full text-center text-base font-sans font-medium hover:bg-primary-dark transition"
            >
              {PRIMARY_CTA.label}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
