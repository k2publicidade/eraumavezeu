"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import InteractiveBook from "@/components/site/InteractiveBook";

export default function FeaturedBookShowcase() {
  const [isBookOpen, setIsBookOpen] = useState(false);
  const handleOpenChange = useCallback((open: boolean) => setIsBookOpen(open), []);

  return (
    <div className="relative isolate mx-auto w-full max-w-[740px] overflow-visible">
      <div
        aria-hidden="true"
        className="absolute bottom-24 left-[5%] right-[12%] h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
      />

      <div className="relative sm:grid sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]">
        <figure
          aria-hidden={isBookOpen}
          className={`absolute left-0 top-[170px] z-20 w-32 transition-all duration-500 ease-out sm:relative sm:left-auto sm:top-auto sm:mt-10 sm:w-auto sm:-mr-10 sm:self-center lg:-mr-12 xl:-mr-10 ${
            isBookOpen
              ? "pointer-events-none -translate-x-5 scale-95 opacity-0"
              : "translate-x-0 scale-100 opacity-100"
          }`}
        >
          <figcaption className="absolute left-1 top-0 flex -translate-y-full items-center gap-2 whitespace-nowrap rounded-sm bg-cream/95 px-2 py-1 text-xs font-semibold text-primary sm:bg-transparent sm:px-0 sm:py-0 sm:text-primary/75">
            <span className="h-px w-5 bg-gold" aria-hidden="true" />
            Bernardo, na vida real
          </figcaption>
          <Image
            src="/be.png"
            alt="Bernardo sorrindo"
            width={400}
            height={667}
            sizes="(max-width: 639px) 128px, (max-width: 1023px) 170px, (max-width: 1279px) 180px, 220px"
            className="h-auto w-full drop-shadow-[0_14px_12px_rgba(27,42,74,0.12)]"
          />
        </figure>

        <div className="relative z-10 min-w-0">
          <InteractiveBook onOpenChange={handleOpenChange} />
        </div>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 150 80"
        fill="none"
        className={`pointer-events-none absolute left-[24%] top-[36%] z-30 h-14 w-[24%] transition-opacity duration-300 sm:left-[25%] sm:top-[34%] sm:h-16 sm:w-[23%] lg:left-[24%] lg:w-[22%] xl:left-[27%] ${
          isBookOpen ? "opacity-0" : "opacity-100"
        }`}
      >
        <path d="M8 64C42 18 88 14 137 39" stroke="#FAF7F2" strokeWidth="8" strokeLinecap="round" opacity="0.92" />
        <path d="M8 64C42 18 88 14 137 39" stroke="#D4A843" strokeWidth="3" strokeLinecap="round" />
        <path d="M125 25L140 40L120 44" stroke="#FAF7F2" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
        <path d="M125 25L140 40L120 44" stroke="#D4A843" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
