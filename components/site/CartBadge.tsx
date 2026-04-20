"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart/store";

export default function CartBadge() {
  const [hydrated, setHydrated] = useState(false);
  const items = useCartStore((s) => s.items);
  useEffect(() => setHydrated(true), []);

  const count = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <Link
      href="/carrinho"
      aria-label={`Carrinho${count > 0 ? ` com ${count} itens` : ""}`}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-primary/20 hover:border-primary transition"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-dark"
        aria-hidden
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {hydrated && count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
