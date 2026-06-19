"use client";

import { useState } from "react";
import Image from "next/image";

export default function InteractiveBook() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center w-full select-none">
      {/* 3D Viewport with Perspective */}
      <div className="book-viewport">
        {/* Book Container with Rotations */}
        <div className={`book-wrap ${isOpen ? "open" : ""}`}>
          
          {/* Hardcover Back (Contra-capa dura) */}
          <div className="book-cover-back" />

          {/* Page Stack (Simula espessura/volume físico das páginas) */}
          <div 
            className="book-pages-stack cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* Inside Right Page (Página Direita estática sob a capa) */}
            <div className="book-page-right">
              <Image
                src="/book_page_2.png"
                alt="Página Direita do Livro"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 240px, 280px"
                priority
              />
              {/* Vinco/sombra central realista */}
              <div className="spine-shadow-right" />
            </div>
          </div>

          {/* Front Cover (Capa dura frontal articulada que abre) */}
          <div
            className={`book-cover-front ${isOpen ? "open" : ""}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* Lado externo da capa (Ilustração da capa) */}
            <div className="book-cover-face-front">
              <Image
                src="/book_cover.png"
                alt="Capa do Livro Era Uma Vez, Eu"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 240px, 280px"
                priority
              />
              {/* Brilho da lombada/vinco da capa dura */}
              <div className="cover-spine-shine" />
            </div>

            {/* Lado interno da capa (Página Esquerda revelada ao abrir) */}
            <div className="book-cover-face-back">
              <Image
                src="/book_page_1.png"
                alt="Página Esquerda do Livro"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 240px, 280px"
                priority
              />
              {/* Vinco/sombra central realista */}
              <div className="spine-shadow-left" />
            </div>
          </div>

          {/* Sombra realista projetada sob o livro */}
          <div className="book-shadow-pedestal" />
        </div>
      </div>

      {/* Button & Subtext Controls */}
      <div className="flex flex-col items-center gap-3 mt-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary text-cream hover:bg-primary-light active:scale-95 px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs flex items-center gap-2.5 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <span>{isOpen ? "Fechar Livro" : "Folhear Livro Mágico"}</span>
          <span className="text-gold">✨</span>
        </button>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-dark/40">
          Clique na capa ou no botão para abrir
        </p>
      </div>
    </div>
  );
}
