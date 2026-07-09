"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BookOpen, Sparkles, Star } from "lucide-react";

type Theme = { slug: string; label: string };
type Sample = {
  id: string;
  theme: string;
  title: string;
  age: string;
  emoji: string;
  coverImage: string;
  images: string[];
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
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

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

  const handleOpenModal = (sample: Sample) => {
    setSelectedSample(sample);
    setActiveImageIndex(0);
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
              onClick={() => handleOpenModal(s)}
              className="bg-white rounded-3xl overflow-hidden border border-gold/15 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
            >
              {/* IMAGE COVER WRAPPER */}
              <div className="aspect-[3/4] relative w-full overflow-hidden bg-cream-deep">
                <Image
                  src={s.coverImage}
                  alt={`Capa do livro ${s.title}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />

                {/* HOVER OVERLAY BUTTON */}
                <div className="absolute inset-0 bg-primary-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                  <span className="bg-white/95 text-primary text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-md border border-gold/15 flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <BookOpen className="w-3.5 h-3.5" />
                    Folhear Livro
                  </span>
                </div>

                {/* EMOJI BADGE */}
                <div className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full bg-cream-light flex items-center justify-center text-base border border-gold/15 shadow-sm">
                  {s.emoji}
                </div>
              </div>

              {/* CARD INFO */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gold-dark uppercase tracking-widest mb-1.5 block">
                    {getThemeLabel(s.theme)}
                  </span>
                  <h3 className="font-serif text-base text-primary font-semibold group-hover:text-gold-dark transition-colors duration-300 leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-xs text-dark/60 mt-2 line-clamp-2">
                    {s.tagline}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-cream-deep flex items-center justify-between">
                  <span className="text-[11px] font-medium text-dark/50">
                    Idade: {s.age}
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
        <div 
          onClick={() => setSelectedSample(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/60 backdrop-blur-md transition-all duration-300 overflow-y-auto"
        >
          {/* Modal Container */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-cream max-w-4xl w-full rounded-3xl overflow-hidden shadow-xl border border-gold/20 grid grid-cols-1 md:grid-cols-2 relative max-h-[92vh] md:max-h-[85vh]"
          >
            
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

            {/* LEFT SIDE: CAROUSEL VIEWER */}
            <div className="p-4 md:p-6 bg-cream-light flex flex-col justify-center border-b md:border-b-0 md:border-r border-gold/10 min-h-[350px] md:min-h-0">
              <div className="w-full relative aspect-[3/4] max-w-xs md:max-w-sm mx-auto bg-white rounded-2xl border border-gold/15 shadow-sm overflow-hidden flex items-center justify-center">
                <Image
                  src={selectedSample.images[activeImageIndex]}
                  alt={`${selectedSample.title} - Página ${activeImageIndex + 1}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority
                />

                {/* Left/Right Buttons inside image */}
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? selectedSample.images.length - 1 : prev - 1))}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-primary flex items-center justify-center border border-gold/15 transition-all shadow-sm z-20 active:scale-90"
                  aria-label="Anterior"
                >
                  ←
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === selectedSample.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-primary flex items-center justify-center border border-gold/15 transition-all shadow-sm z-20 active:scale-90"
                  aria-label="Próximo"
                >
                  →
                </button>

                {/* Page indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-primary/75 backdrop-blur-xs text-cream text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {activeImageIndex + 1} / {selectedSample.images.length}
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="flex gap-1.5 justify-center mt-4 overflow-x-auto py-1 max-w-xs md:max-w-sm mx-auto scrollbar-none">
                {selectedSample.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={cn(
                      "relative w-9 h-12 rounded-md overflow-hidden border transition-all flex-shrink-0",
                      activeImageIndex === index 
                        ? "border-gold ring-1 ring-gold shadow-sm scale-105" 
                        : "border-cream-deep/30 opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={img}
                      alt={`Página ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  </button>
                ))}
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
                  <h4 className="font-serif text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-gold" />
                    Sobre o livro personalizado:
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
                  Comece agora e veja a prévia do seu livro em minutos
                </p>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
