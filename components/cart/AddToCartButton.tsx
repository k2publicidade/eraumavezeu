"use client";

import { useState } from "react";
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

  return (
    <button
      type="button"
      onClick={() => {
        addItem(product);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1800);
      }}
      className={
        className ??
        "bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary-dark transition text-sm font-medium"
      }
    >
      {justAdded ? "✓ Adicionado" : label}
    </button>
  );
}
