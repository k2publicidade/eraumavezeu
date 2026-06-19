"use client";

import { useState } from "react";
import Image from "next/image";
import InteractiveBook from "./InteractiveBook";

export default function ProductGallery() {
  const [activeTab, setActiveTab] = useState<"3d" | "page1" | "page2">("3d");

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      {/* Active Display */}
      <div className="bg-[#FCFAF7] border border-cream-deep/25 rounded-[24px] p-3 sm:p-4 shadow-premium relative min-h-[320px] sm:min-h-[370px] flex items-center justify-center overflow-hidden">
        {/* Book spine decoration background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#FAF7F2_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {activeTab === "3d" && (
          <div className="w-full flex justify-center animate-fade-in py-2">
            <InteractiveBook />
          </div>
        )}

        {activeTab === "page1" && (
          <div className="relative w-[210px] h-[270px] sm:w-[250px] sm:h-[320px] rounded-l-[12px] overflow-hidden shadow-2xl animate-fade-in border-y border-l border-cream-deep/30">
            <Image
              src="/book_page_1.png"
              alt="Página Interna 1"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 210px, 250px"
              priority
            />
            {/* Spine fold shading */}
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/15 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
          </div>
        )}

        {activeTab === "page2" && (
          <div className="relative w-[210px] h-[270px] sm:w-[250px] sm:h-[320px] rounded-r-[12px] overflow-hidden shadow-2xl animate-fade-in border-y border-r border-cream-deep/30">
            <Image
              src="/book_page_2.png"
              alt="Página Interna 2"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 210px, 250px"
              priority
            />
            {/* Spine fold shading */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-2.5 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />
          </div>
        )}
      </div>

      {/* Tabs / Selectors */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => setActiveTab("3d")}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-300 ${
            activeTab === "3d"
              ? "border-gold bg-gold/5 shadow-sm text-gold"
              : "border-cream-deep/20 bg-white text-dark/60 hover:border-gold/30 hover:text-dark"
          }`}
        >
          <div className="relative w-8 h-11 rounded overflow-hidden shadow-sm border border-cream-deep/15">
            <Image
              src="/book_cover.png"
              alt="Capa thumbnail"
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">3D Interativo</span>
        </button>

        <button
          onClick={() => setActiveTab("page1")}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-300 ${
            activeTab === "page1"
              ? "border-gold bg-gold/5 shadow-sm text-gold"
              : "border-cream-deep/20 bg-white text-dark/60 hover:border-gold/30 hover:text-dark"
          }`}
        >
          <div className="relative w-8 h-11 rounded overflow-hidden shadow-sm border border-cream-deep/15">
            <Image
              src="/book_page_1.png"
              alt="Página 1 thumbnail"
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">Pág. Interna 1</span>
        </button>

        <button
          onClick={() => setActiveTab("page2")}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-300 ${
            activeTab === "page2"
              ? "border-gold bg-gold/5 shadow-sm text-gold"
              : "border-cream-deep/20 bg-white text-dark/60 hover:border-gold/30 hover:text-dark"
          }`}
        >
          <div className="relative w-8 h-11 rounded overflow-hidden shadow-sm border border-cream-deep/15">
            <Image
              src="/book_page_2.png"
              alt="Página 2 thumbnail"
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">Pág. Interna 2</span>
        </button>
      </div>
    </div>
  );
}
