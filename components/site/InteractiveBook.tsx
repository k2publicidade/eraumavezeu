"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const PAGES = [
  "/livro/Era Uma Vez - Bernardo_Página_01.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_02.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_03.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_04.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_05.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_06.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_07.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_08.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_09.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_10.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_11.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_12.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_13.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_14.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_15.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_16.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_17.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_18.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_19.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_20.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_21.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_22.jpg",
  "/livro/Era Uma Vez - Bernardo_Página_23.jpg",
];

export default function InteractiveBook() {
  const [currentSpread, setCurrentSpread] = useState(0);
  const totalSheets = 11; // 11 sheets + 1 stationary page on right = 23 pages

  const nextPage = useCallback(() => {
    if (currentSpread < 11) {
      setCurrentSpread((prev) => prev + 1);
    }
  }, [currentSpread]);

  const prevPage = useCallback(() => {
    if (currentSpread > 0) {
      setCurrentSpread((prev) => prev - 1);
    }
  }, [currentSpread]);

  const resetBook = useCallback(() => {
    setCurrentSpread(0);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      // Skip keyboard turning if user is typing in a form input/textarea
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        nextPage();
      } else if (e.key === "ArrowLeft") {
        prevPage();
      } else if (e.key === "Escape") {
        resetBook();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPage, prevPage, resetBook]);

  return (
    <div className="flex flex-col items-center justify-center w-full select-none">
      {/* 3D Viewport with Perspective */}
      <div className="book-viewport">
        {/* Book Container with Rotations */}
        <div className={`book-wrap ${currentSpread > 0 ? "open" : ""}`}>
          
          {/* Hardcover Back (Contra-capa dura estática) */}
          <div className="book-cover-back" />

          {/* Page Stack (Simula espessura/volume físico das páginas) */}
          <div className="book-pages-stack">
            {/* Inside Right Page (Página Direita estática no fundo: Página 23) */}
            <div className="book-page-right">
              <Image
                src={PAGES[22]}
                alt="Última Página do Livro"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 240px, 280px"
                priority
              />
              {/* Vinco/sombra central realista */}
              <div className="spine-shadow-right" />
            </div>
          </div>

          {/* Render all 11 turnable sheets dynamically */}
          {Array.from({ length: totalSheets }).map((_, i) => {
            const isFlipped = i < currentSpread;
            // zIndex mapping: flipped sheets go 0 to 10 (bottom to top on left),
            // unflipped sheets go 11 to 0 (top to bottom on right)
            const zIndex = isFlipped ? i : totalSheets - i;
            const rotation = isFlipped ? -180 : 0;

            // Sheet 0 is the Hardcover Front
            if (i === 0) {
              return (
                <div
                  key={i}
                  className="book-cover-front"
                  style={{
                    transform: `rotateY(${rotation}deg)`,
                    zIndex: zIndex,
                    transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentSpread === 0) {
                      nextPage();
                    } else {
                      prevPage();
                    }
                  }}
                >
                  {/* Lado externo da capa (Ilustração da capa) */}
                  <div className="book-cover-face-front">
                    <Image
                      src={PAGES[0]}
                      alt="Capa do Livro Era Uma Vez, Eu"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 240px, 280px"
                      priority
                    />
                    <div className="cover-spine-shine" />
                  </div>

                  {/* Lado interno da capa (Página 2, esquerda ao abrir) */}
                  <div className="book-cover-face-back">
                    <Image
                      src={PAGES[1]}
                      alt="Página 2 do Livro"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 240px, 280px"
                      priority
                    />
                    <div className="spine-shadow-left" />
                  </div>
                </div>
              );
            }

            // Sheets 1 to 10 are normal paper pages
            return (
              <div
                key={i}
                className="absolute inset-0 cursor-pointer"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "left center",
                  transform: `rotateY(${rotation}deg)`,
                  zIndex: zIndex,
                  transition: "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFlipped) {
                    prevPage();
                  } else {
                    nextPage();
                  }
                }}
              >
                {/* Front Face (shows right page, e.g. Page 3, 5, 7...) */}
                <div className="book-page-sheet-front">
                  <Image
                    src={PAGES[2 * i]}
                    alt={`Página ${2 * i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 240px, 280px"
                    loading="lazy"
                  />
                  <div className="spine-shadow-right" />
                </div>

                {/* Back Face (shows left page, e.g. Page 4, 6, 8...) */}
                <div className="book-page-sheet-back">
                  <Image
                    src={PAGES[2 * i + 1]}
                    alt={`Página ${2 * i + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 240px, 280px"
                    loading="lazy"
                  />
                  <div className="spine-shadow-left" />
                </div>
              </div>
            );
          })}

          {/* Sombra realista projetada sob o livro */}
          <div className="book-shadow-pedestal" />
        </div>
      </div>

      {/* Navigation Controls & Pagination Indicators */}
      <div className="flex flex-col items-center gap-4 mt-6 w-full max-w-xs sm:max-w-sm px-4">
        {currentSpread === 0 ? (
          <button
            onClick={nextPage}
            className="bg-primary text-cream hover:bg-primary-light active:scale-95 px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs flex items-center gap-2.5 shadow-lg hover:shadow-xl transition-all duration-300 font-sans"
          >
            <span>Folhear Livro Mágico</span>
            <span className="text-gold">✨</span>
          </button>
        ) : (
          <div className="flex items-center justify-between w-full gap-4">
            <button
              onClick={prevPage}
              className="bg-primary text-cream hover:bg-primary-light active:scale-95 px-4 py-2.5 rounded-full font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 shadow transition-all duration-300 font-sans"
            >
              <span>← Voltar</span>
            </button>

            <span className="text-xs font-serif font-bold text-primary">
              {currentSpread === 11 
                ? "Pág. 22 - 23 (Fim)" 
                : `Páginas ${2 * currentSpread} - ${2 * currentSpread + 1} de 23`}
            </span>

            {currentSpread < 11 ? (
              <button
                onClick={nextPage}
                className="bg-primary text-cream hover:bg-primary-light active:scale-95 px-4 py-2.5 rounded-full font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 shadow transition-all duration-300 font-sans"
              >
                <span>Avançar →</span>
              </button>
            ) : (
              <button
                onClick={resetBook}
                className="bg-gold text-primary hover:bg-gold-light active:scale-95 px-4 py-2.5 rounded-full font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 shadow transition-all duration-300 font-sans font-extrabold"
              >
                <span>Recomeçar ↺</span>
              </button>
            )}
          </div>
        )}

        {/* Dynamic Progress Bar */}
        {currentSpread > 0 && (
          <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-gold transition-all duration-500 ease-out"
              style={{ width: `${(currentSpread / 11) * 100}%` }}
            />
          </div>
        )}

        <p className="text-[9px] font-semibold uppercase tracking-wider text-dark/45 text-center font-sans">
          {currentSpread === 0 
            ? "Clique na capa ou no botão para abrir" 
            : "Use setas do teclado ou clique nas páginas para folhear"}
        </p>
      </div>
    </div>
  );
}
