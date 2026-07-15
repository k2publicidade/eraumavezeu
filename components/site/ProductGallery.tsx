"use client";

import { useState } from "react";
import InteractiveBook from "./InteractiveBook";
import ProductMediaCarousel from "./ProductMediaCarousel";
import { BOOK_COVER_SHOWCASE_MEDIA } from "@/lib/gallery-data";

export default function ProductGallery() {
  const [activeTab, setActiveTab] = useState<"interactive" | "covers">("interactive");

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Selector Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex gap-1 p-1 bg-cream-deep/15 rounded-full border border-cream-deep/10 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("interactive")}
            className={`py-1.5 px-4 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${
              activeTab === "interactive"
                ? "bg-primary text-cream shadow-md"
                : "text-primary/70 hover:text-primary hover:bg-cream-deep/5"
            }`}
          >
            📖 Folhear Exemplo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("covers")}
            className={`py-1.5 px-4 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${
              activeTab === "covers"
                ? "bg-primary text-cream shadow-md"
                : "text-primary/70 hover:text-primary hover:bg-cream-deep/5"
            }`}
          >
            ✨ Capas da Coleção
          </button>
        </div>
      </div>

      {/* Active Display */}
      <div className="bg-[#FCFAF7] border border-cream-deep/25 rounded-[24px] p-3 sm:p-4 shadow-premium relative min-h-[320px] sm:min-h-[370px] flex items-center justify-center overflow-hidden">
        {/* Book spine decoration background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#FAF7F2_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="w-full flex justify-center animate-fade-in py-2">
          {activeTab === "interactive" ? (
            <InteractiveBook />
          ) : (
            <ProductMediaCarousel
              images={BOOK_COVER_SHOWCASE_MEDIA}
              productName="Livro Capa Dura"
              showThumbnails
              className="w-full max-w-[280px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
