"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Images,
  Palette,
  Puzzle,
  Sparkles,
  Sticker,
  X,
} from "lucide-react";
import { useModalFocus } from "@/lib/hooks/use-modal-focus";
import type { GallerySample } from "@/lib/gallery-data";

type Theme = { slug: string; label: string };
type Props = {
  themes: readonly Theme[];
  samples: readonly GallerySample[];
};

const collectionIcons = {
  book: BookOpen,
  EBOOK: Download,
  LIVRO_COLORIR: Palette,
  QUEBRA_CABECA: Puzzle,
  CARTELA_ADESIVOS: Sticker,
} as const;

export default function GalleryFilter({ themes, samples }: Props) {
  const [active, setActive] = useState<string>("todos");
  const [selectedSample, setSelectedSample] = useState<GallerySample | null>(null);
  const [activeCollectionId, setActiveCollectionId] = useState("book");
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalTriggerRef = useRef<HTMLButtonElement | null>(null);

  // Filter samples based on selected theme
  const filtered = useMemo(() => {
    if (active === "todos") return samples;
    return samples.filter((s) => s.theme === active);
  }, [active, samples]);

  const closeModal = useCallback(() => setSelectedSample(null), []);

  useModalFocus({
    isOpen: selectedSample !== null,
    onClose: closeModal,
    containerRef: modalRef,
    initialFocusRef: closeButtonRef,
    returnFocusRef: modalTriggerRef,
  });

  // Find theme label helper
  const getThemeLabel = (slug: string) => {
    return themes.find((t) => t.slug === slug)?.label || slug;
  };

  const handleOpenModal = (sample: GallerySample, trigger: HTMLButtonElement) => {
    modalTriggerRef.current = trigger;
    setSelectedSample(sample);
    setActiveCollectionId("book");
    setActiveImageIndex(0);
  };

  const selectedCollections = selectedSample
    ? [
        {
          id: "book",
          label: "Livro personalizado",
          shortLabel: "Livro",
          description: "Capa e cenas internas da história personalizada.",
          images: selectedSample.images,
        },
        ...selectedSample.additionalProducts.map((product) => ({
          id: product.type,
          label: product.label,
          shortLabel: product.shortLabel,
          description: product.description,
          images: product.images,
        })),
      ]
    : [];
  const activeCollection =
    selectedCollections.find((collection) => collection.id === activeCollectionId) ??
    selectedCollections[0];
  const activeImages = activeCollection?.images ?? [];

  const selectCollection = (collectionId: string) => {
    setActiveCollectionId(collectionId);
    setActiveImageIndex(0);
  };

  const showPreviousImage = () => {
    setActiveImageIndex((previous) =>
      previous === 0 ? activeImages.length - 1 : previous - 1,
    );
  };

  const showNextImage = () => {
    setActiveImageIndex((previous) =>
      previous === activeImages.length - 1 ? 0 : previous + 1,
    );
  };

  return (
    <>
      {/* FILTER TABS */}
      <div className="mx-auto mb-12 flex max-w-4xl flex-wrap justify-center gap-2 px-2" aria-label="Filtrar histórias por tema">
        {themes.map((t) => {
          const isActive = t.slug === active;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => setActive(t.slug)}
              aria-pressed={isActive}
              className={cn(
                "min-h-11 rounded-full border px-5 py-2.5 text-sm font-semibold transition-[background-color,color,border-color,transform] duration-300",
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {filtered.map((s, index) => (
            <article
              key={s.id}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <button
                type="button"
                onClick={(event) => handleOpenModal(s, event.currentTarget)}
                className="absolute inset-0 z-30 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                aria-label={`Ver o livro e os produtos adicionais de ${s.title}`}
              />
              {/* IMAGE COVER WRAPPER */}
              <div className="aspect-[3/4] relative w-full overflow-hidden bg-cream-deep">
                <Image
                  src={s.coverImage}
                  alt={`Capa do livro ${s.title}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={index < 4}
                />

                {/* HOVER OVERLAY BUTTON */}
                <div className="absolute inset-0 bg-primary-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                  <span className="flex min-h-11 translate-y-2 items-center gap-1.5 rounded-full border border-gold/15 bg-white/95 px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary shadow-md transition-transform duration-300 group-hover:translate-y-0">
                    <BookOpen className="w-3.5 h-3.5" />
                    Ver livro e adicionais
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
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gold-dark">
                    {getThemeLabel(s.theme)}
                  </span>
                  <h3 className="font-serif text-base text-primary font-semibold group-hover:text-gold-dark transition-colors duration-300 leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-xs text-dark/60 mt-2 line-clamp-2">
                    {s.tagline}
                  </p>
                  <div className="mt-4 flex items-center gap-2" aria-label={`${s.additionalProducts.length} produtos adicionais disponíveis`}>
                    <div className="flex -space-x-2" aria-hidden="true">
                      {s.additionalProducts.slice(0, 4).map((product) => (
                        <span key={product.type} className="relative h-9 w-9 overflow-hidden rounded-full bg-cream ring-2 ring-white">
                          <Image src={product.images[0]} alt="" fill className="object-cover" sizes="36px" />
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-semibold leading-tight text-primary/75">
                      Livro + {s.additionalProducts.length} adicionais
                    </span>
                  </div>
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
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-primary-dark/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        >
          {/* Modal Container */}
          <div 
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-dialog-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="relative grid max-h-[96dvh] w-full max-w-6xl grid-cols-1 overflow-y-auto rounded-t-2xl bg-cream shadow-xl sm:max-h-[92dvh] sm:rounded-2xl lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:overflow-hidden"
          >
            
            {/* CLOSE BUTTON */}
            <button
              ref={closeButtonRef}
              onClick={closeModal}
              className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-sm transition-colors hover:bg-cream hover:text-primary-dark active:scale-95 sm:right-4 sm:top-4"
              aria-label="Fechar detalhes"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* LEFT SIDE: BOOK AND ADDITIONAL PRODUCT VIEWER */}
            <div className="flex min-h-[520px] flex-col border-b border-primary/10 bg-primary-dark p-4 text-white lg:min-h-0 lg:border-b-0 lg:border-r lg:p-6">
              <div className="mb-5 pr-12 sm:pr-14">
                <p className="text-sm font-semibold text-gold-light">Coleção de {selectedSample.title.split(" e ")[0]}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">Escolha um item para explorar cada detalhe da personalização.</p>
              </div>

              <div className="mb-5 max-w-full overflow-x-auto pb-1" role="tablist" aria-label="Escolher produto da história">
                <div className="flex w-max min-w-full gap-2">
                  {selectedCollections.map((collection) => {
                    const isActive = activeCollection?.id === collection.id;
                    const Icon = collectionIcons[collection.id as keyof typeof collectionIcons] ?? Images;
                    return (
                      <button
                        key={collection.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => selectCollection(collection.id)}
                        className={cn(
                          "flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                          isActive
                            ? "bg-gold text-primary-dark"
                            : "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15",
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {collection.shortLabel} ({collection.images.length})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className="relative mx-auto flex aspect-[4/5] w-full max-w-[27rem] items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg"
                onKeyDown={(event) => {
                  if (activeImages.length <= 1) return;
                  if (event.key === "ArrowLeft") showPreviousImage();
                  if (event.key === "ArrowRight") showNextImage();
                }}
              >
                <Image
                  src={activeImages[activeImageIndex]}
                  alt={`${activeCollection?.label} de ${selectedSample.title}, exemplo ${activeImageIndex + 1} de ${activeImages.length}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 400px"
                />

                {activeImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousImage}
                      className="absolute left-2.5 top-1/2 z-20 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary-dark/90 text-white transition-colors hover:bg-primary"
                      aria-label="Ver imagem anterior"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={showNextImage}
                      className="absolute right-2.5 top-1/2 z-20 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary-dark/90 text-white transition-colors hover:bg-primary"
                      aria-label="Ver próxima imagem"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-dark/90 px-3 py-1.5 text-xs font-semibold text-white" aria-live="polite">
                  {activeImageIndex + 1} de {activeImages.length}
                </div>
              </div>

              {activeImages.length > 1 && (
                <div className="mx-auto mt-4 flex max-w-full gap-2 overflow-x-auto px-1 py-1">
                  {activeImages.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Mostrar exemplo ${index + 1} de ${activeCollection?.label}`}
                      aria-pressed={activeImageIndex === index}
                      className={cn(
                        "relative h-14 w-11 flex-none overflow-hidden rounded-md transition-opacity",
                        activeImageIndex === index
                          ? "ring-2 ring-gold ring-offset-2 ring-offset-primary-dark"
                          : "opacity-55 ring-1 ring-white/20 hover:opacity-100",
                      )}
                    >
                      <Image src={image} alt="" fill className="object-cover" sizes="44px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT SIDE: DETAILS PANEL */}
            <div className="flex flex-col justify-between overflow-y-visible p-6 lg:max-h-[92dvh] lg:overflow-y-auto lg:p-8">
              <div>
                {/* Header Metadata */}
                <div className="mb-4 flex flex-wrap items-center gap-2 pr-10">
                  <span className="text-xl">{selectedSample.emoji}</span>
                  <span className="rounded-full border border-gold/10 bg-gold/10 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-gold-dark">
                    Tema: {getThemeLabel(selectedSample.theme)}
                  </span>
                  <span className="rounded-full border border-primary/5 bg-primary/5 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-primary/75">
                    {selectedSample.age}
                  </span>
                </div>

                {/* Story Info */}
                <h3 id="gallery-dialog-title" className="mb-1 text-balance font-serif text-2xl font-bold leading-tight text-primary md:text-3xl">
                  {selectedSample.bookTitle}
                </h3>
                <p className="mb-6 font-sans text-sm font-medium text-gold-dark">
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

                <div className="mb-6 rounded-xl bg-white p-4 shadow-xs">
                  <div className="flex items-start gap-3">
                    {activeCollection && (() => {
                      const ActiveIcon = collectionIcons[activeCollection.id as keyof typeof collectionIcons] ?? Images;
                      return <ActiveIcon className="mt-0.5 h-5 w-5 flex-none text-gold-dark" aria-hidden="true" />;
                    })()}
                    <div>
                      <p className="text-sm font-semibold text-primary">{activeCollection?.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-dark/75">{activeCollection?.description}</p>
                    </div>
                  </div>
                </div>

                {/* Quote / Book Excerpt */}
                <div className="bg-rose-pale border border-gold/25 rounded-xl p-4 mb-6 italic relative overflow-hidden">
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
                  className="group flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-cream shadow-md transition-colors duration-300 hover:bg-primary-light"
                >
                  <span>Criar com este tema</span>
                  <span className="transition-transform group-hover:translate-x-1 font-bold text-gold">→</span>
                </Link>
                <Link
                  href="/produtos#produtos-adicionais"
                  className="min-h-11 rounded-full px-6 py-3 text-center text-sm font-semibold text-primary ring-1 ring-primary/20 transition-colors hover:bg-white"
                >
                  Ver todos os produtos e preços
                </Link>
                <p className="text-center text-xs leading-relaxed text-dark/65">
                  Você escolhe os adicionais depois de personalizar o livro.
                </p>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
