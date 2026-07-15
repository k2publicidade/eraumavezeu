"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductMediaCarouselProps = {
  images: readonly string[];
  productName: string;
  className?: string;
  showThumbnails?: boolean;
  priority?: boolean;
};

export default function ProductMediaCarousel({
  images,
  productName,
  className,
  showThumbnails = false,
  priority = false,
}: ProductMediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  if (images.length === 0) return null;

  const showNavigation = images.length > 1;
  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };
  const goToNext = () => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  return (
    <div
      className={cn("min-w-0", className)}
      role="region"
      aria-label={`Galeria de exemplos de ${productName}`}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") goToPrevious();
        if (event.key === "ArrowRight") goToNext();
      }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream-light ring-1 ring-primary/10">
        <Image
          key={images[activeIndex]}
          src={images[activeIndex]}
          alt={`${productName} personalizado, exemplo ${activeIndex + 1} de ${images.length}`}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 88vw, (max-width: 1024px) 38vw, 220px"
          priority={priority}
        />

        {showNavigation && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-primary ring-1 ring-primary/10 transition-colors hover:bg-cream focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`Ver exemplo anterior de ${productName}`}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-primary ring-1 ring-primary/10 transition-colors hover:bg-cream focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`Ver próximo exemplo de ${productName}`}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}

        <p
          className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-semibold text-white"
          aria-live="polite"
        >
          {activeIndex + 1} de {images.length}
        </p>
      </div>

      {showThumbnails && showNavigation && (
        <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-2" aria-label="Escolher exemplo">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Mostrar exemplo ${index + 1} de ${productName}`}
              aria-pressed={index === activeIndex}
              className={cn(
                "relative h-14 w-11 flex-none overflow-hidden rounded-md bg-cream-light transition-opacity",
                index === activeIndex
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-cream"
                  : "opacity-55 ring-1 ring-primary/15 hover:opacity-100",
              )}
            >
              <Image src={image} alt="" fill className="object-cover" sizes="44px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
