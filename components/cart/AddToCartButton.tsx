"use client";

import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/lib/cart/store";
import type { CartProduct } from "@/lib/cart/types";

type Props = {
  product: CartProduct;
  label?: string;
  className?: string;
};

export default function AddToCartButton({
  product,
  label = "Adicionar ao carrinho",
  className,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          addItem(product);
          setJustAdded(true);
          if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
          resetTimerRef.current = setTimeout(() => setJustAdded(false), 1800);
        }}
        className={className ?? "btn-primary"}
      >
        {justAdded ? "✓ Adicionado" : label}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {justAdded ? `${product.name} adicionado ao carrinho.` : ""}
      </span>
    </>
  );
}
