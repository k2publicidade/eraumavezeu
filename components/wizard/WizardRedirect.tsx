"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/cart/store";
import { useWizardStore } from "@/lib/wizard/store";
import type { ProductType } from "@/lib/cart/types";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    type: ProductType;
    price: number;
  };
};

export default function WizardRedirect({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasAdded = useRef(false);

  useEffect(() => {
    if (hasAdded.current) return;
    hasAdded.current = true;

    // Get initial customization values from wizard store (interactive hero panel)
    const wizardState = useWizardStore.getState();

    // Read theme from URL parameter or wizard store
    const urlTheme = searchParams.get("theme");
    const theme = urlTheme || wizardState.theme || "";

    const favoriteColor = wizardState.favoriteColor || "";
    const childName = wizardState.childName || "";
    const dedication = wizardState.dedication || "";

    // Check if the main book is already in the cart
    const hasMainBook = items.some((item) => item.type === "LIVRO_PRINCIPAL");

    if (!hasMainBook) {
      addItem({
        id: product.id,
        slug: product.slug,
        name: product.name,
        type: product.type,
        price: product.price,
        customization: (childName || theme || favoriteColor || dedication) ? {
          theme: theme.replaceAll("_", " "),
          genre: wizardState.genre || "",
          artStyle: wizardState.artStyle || "",
          favoriteColor: favoriteColor,
          ageRange: wizardState.ageRange || "",
          childName: childName,
          dedication: dedication,
          photoKeys: [],
          consentAcceptedAt: "",
          consentTextVersion: "",
        } : undefined,
      });
    }

    // Redirect directly to the cart page
    router.replace("/carrinho");
  }, [addItem, items, product, router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4" role="status" aria-live="polite">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" aria-hidden="true" />
      <p className="text-dark/70 font-medium">Direcionando você para o carrinho...</p>
    </div>
  );
}
