"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "portrait";
};

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Antes",
  afterLabel = "Depois",
  className = "",
  aspectRatio = "square",
}: Props) {
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  }[aspectRatio];

  return (
    <div
      className={cn(
        "relative select-none overflow-hidden rounded-2xl border border-gold/15 bg-cream-deep shadow-md group cursor-ew-resize",
        aspectClass,
        className
      )}
    >
      <input
        type="range"
        min={0}
        max={100}
        value={sliderPosition}
        onChange={(event) => setSliderPosition(Number(event.target.value))}
        aria-label={`Comparar ${beforeLabel} e ${afterLabel}`}
        aria-valuetext={`${Math.round(sliderPosition)}% da imagem ${afterLabel}`}
        className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
      />
      {/* BEFORE IMAGE (Real Child Photo - Base) */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={beforeImage}
          alt="Foto real da criança"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover pointer-events-none"
          priority
        />
        {/* Label Badge */}
        <span className="absolute bottom-4 left-4 z-10 rounded-full bg-primary/75 px-3 py-1 text-xs font-semibold text-cream backdrop-blur-sm shadow-sm transition-opacity duration-300 group-hover:opacity-100 md:opacity-75">
          {beforeLabel}
        </span>
      </div>

      {/* AFTER IMAGE (AI Illustration - Overlaid & Clipped) */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <Image
          src={afterImage}
          alt="Ilustração do livro"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover pointer-events-none"
          priority
        />
        {/* Label Badge */}
        <span className="absolute bottom-4 right-4 z-10 rounded-full bg-gold/90 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm shadow-sm transition-opacity duration-300 group-hover:opacity-100 md:opacity-75">
          {afterLabel}
        </span>
      </div>

      {/* SLIDER LINE DIVIDER */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-gold-light pointer-events-none shadow-gold"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* HANDLE BUTTON */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-gold text-primary shadow-lg border-2 border-cream flex items-center justify-center transition-transform duration-150 scale-100 group-hover:scale-105">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-4 h-4 text-primary"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
              className="rotate-90 origin-center"
            />
          </svg>
        </div>
      </div>

      {/* SUBTLE INTERACTION HINT OVERLAY */}
      <div className="absolute inset-x-0 top-4 text-center pointer-events-none transition-opacity duration-500 opacity-100 group-hover:opacity-0">
        <span className="inline-block rounded-full bg-dark/40 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white shadow-sm">
          Arraste ou use as setas do teclado para comparar
        </span>
      </div>
    </div>
  );
}
