"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { cn } from "@/lib/utils";

type Theme = { slug: string; label: string };
type Sample = {
  id: string;
  theme: string;
  title: string;
  age: string;
  emoji: string;
  beforeImage: string;
  afterImage: string;
  tagline: string;
  description: string;
  bookTitle: string;
  quote: string;
};

type Props = {
  themes: readonly Theme[];
  samples: readonly Sample[];
};

export default function GalleryFilter({ themes, samples }: Props) {
  const [active, setActive] = useState<string>("todos");
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

  // Filter samples based on selected theme
  const filtered = useMemo(() => {
    if (active === "todos") return samples;
    return samples.filter((s) => s.theme === active);
  }, [active, samples]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedSample) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedSample]);

  // Find theme label helper
  const getThemeLabel = (slug: string) => {
    return themes.find((t) => t.slug === slug)?.label || slug;
  };

  return (
    <>
      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2 justify-center mb-12 max-w-4xl mx-auto px-2">
        {themes.map((t) => {
          const isActive = t.slug === active;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => setActive(t.slug)}
              aria-pressed={isActive}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border",
                isActive
                  ? "bg-primary text-cream border-primary shadow-md scale-105"
                  : "bg-cream-light text-primary/75 border-gold/15 hover:border-gold hover:text-primary hover:bg-white"
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* GALLERY GRID */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-cream-light rounded-3xl border border-gold/15 max-w-md mx-auto px-6">
          <span className="text-4xl block mb-3">✨</span>
          <h3 className="font-serif text-lg text-primary font-semibold">Em Breve</h3>
          <p className="text-sm text-dark/60 mt-2">
            Estamos preparando histórias incríveis sob este tema. Escolha outro tema ou seja o primeiro a criar um livro personalizado dele!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((s) => (
            <article
              key={s.id}
              onClick={() => setSelectedSample(s)}
              className="bg-white rounded-3xl overflow-hidden border border-gold/15 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
            >
              {/* IMAGE HOVER CROSS-FADE WRAPPER */}
              <div className="aspect-square relative w-full overflow-hidden bg-cream-deep">
                {/* AFTER IMAGE (Illustration - Default visible) */}
                <div className="absolute inset-0 w-full h-full transition-opacity duration-500 opacity-100 group-hover:opacity-0 z-10">
                  <Image
                    src={s.afterImage}
                    alt={`Ilustração do livro ${s.title}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                    priority
                  />
                </div>

                {/* BEFORE IMAGE (Real Child - Visible on hover) */}
                <div className="absolute inset-0 w-full h-full transition-opacity duration-500 opacity-0 group-hover:opacity-100 z-0">
                  <Image
                    src={s.beforeImage}
                    alt={`Foto real de referência de ${s.title}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>

                {/* FLOATING REAL PHOTO ROUND THUMBNAIL */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full p-1 pr-3 border border-gold/20 shadow-sm transition-transform group-hover:scale-105 duration-300">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gold">
                    <Image
                      src={s.beforeImage}
                      alt="Foto da criança"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Antes
                  </span>
                </div>

                {/* EMOJI BADGE */}
                <div className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full bg-cream-light flex items-center justify-center text-base border border-gold/15 shadow-sm">
                  {s.emoji}
                </div>
              </div>

              {/* CARD INFO */}
              <div className="p-5 flex flex-col flex-1">
                <span className="text-[10px] font-bold text-gold-dark uppercase tracking-widest mb-1.5">
                  {getThemeLabel(s.theme)}
                </span>
                <h3 className="font-serif text-base text-primary font-semibold group-hover:text-gold-dark transition-colors duration-300 leading-snug">
                  {s.title}
                </h3>
                <p className="text-xs text-dark/60 mt-2 line-clamp-2 flex-1">
                  {s.tagline}
                </p>
                <div className="mt-4 pt-3 border-t border-cream-deep flex items-center justify-between">
                  <span className="text-[11px] font-medium text-dark/50">
                    Protagonista: {s.age}
                  </span>
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1 group-hover:text-gold transition-colors">
                    Ver detalhes <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* DETAIL MODAL (LIGHTBOX) */}
      {selectedSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/60 backdrop-blur-md transition-all duration-300 overflow-y-auto">
          {/* Modal Container */}
          <div className="bg-cream max-w-4xl w-full rounded-3xl overflow-hidden shadow-xl border border-gold/20 grid grid-cols-1 md:grid-cols-2 relative max-h-[92vh] md:max-h-[85vh]">
            
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelectedSample(null)}
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/95 border border-gold/15 shadow-sm flex items-center justify-center text-primary hover:text-gold hover:scale-105 active:scale-95 transition-all duration-200"
              aria-label="Fechar detalhes"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* LEFT SIDE: SLIDER */}
            <div className="p-4 md:p-6 bg-cream-light flex items-center justify-center border-b md:border-b-0 md:border-r border-gold/10">
              <div className="w-full max-w-sm md:max-w-md relative">
                <BeforeAfterSlider
                  beforeImage={selectedSample.beforeImage}
                  afterImage={selectedSample.afterImage}
                  className="shadow-md"
                />
              </div>
            </div>

            {/* RIGHT SIDE: DETAILS PANEL */}
            <div className="p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[85vh]">
              <div>
                {/* Header Metadata */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{selectedSample.emoji}</span>
                  <span className="text-[10px] font-bold text-gold-dark uppercase tracking-widest bg-gold/10 px-2.5 py-1 rounded-full border border-gold/10">
                    Tema: {getThemeLabel(selectedSample.theme)}
                  </span>
                  <span className="text-[10px] font-bold text-primary/75 uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-full border border-primary/5">
                    {selectedSample.age}
                  </span>
                </div>

                {/* Story Info */}
                <h3 className="font-serif text-2xl md:text-3xl text-primary font-bold leading-tight mb-1">
                  {selectedSample.bookTitle}
                </h3>
                <p className="font-sans text-sm text-gold-dark font-medium italic mb-6">
                  &ldquo;{selectedSample.tagline}&rdquo;
                </p>

                {/* Transform Description */}
                <div className="space-y-4 text-sm text-dark/80 leading-relaxed mb-6">
                  <h4 className="font-serif text-sm font-bold text-primary uppercase tracking-wider">
                    Como a foto se transformou:
                  </h4>
                  <p>{selectedSample.description}</p>
                </div>

                {/* Quote / Book Excerpt */}
                <div className="bg-rose-pale border-l-2 border-gold rounded-r-2xl p-4 mb-6 italic relative overflow-hidden">
                  <span className="absolute -top-2 -left-1 text-5xl text-gold/20 font-serif pointer-events-none select-none">
                    &ldquo;
                  </span>
                  <p className="text-xs text-primary-light font-medium relative z-10 leading-relaxed pl-3 font-serif">
                    {selectedSample.quote}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-cream-deep mt-4 flex flex-col gap-2">
                <Link
                  href={`/personalizar?theme=${selectedSample.theme}`}
                  className="bg-primary text-cream hover:bg-primary-light transition-all duration-300 rounded-full py-3 px-6 text-xs font-semibold uppercase tracking-widest text-center shadow-md flex items-center justify-center gap-2 group"
                >
                  <span>Personalizar este tema</span>
                  <span className="transition-transform group-hover:translate-x-1 font-bold text-gold">→</span>
                </Link>
                <p className="text-[10px] text-dark/40 text-center">
                  Comece agora e veja a prévia 3D do seu livro em minutos
                </p>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
