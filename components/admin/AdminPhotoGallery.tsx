"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Download, X, ChevronLeft, ChevronRight, ZoomIn, Loader2 } from "lucide-react";

type SignedPhoto = {
  key: string;
  url: string | null;
};

type Props = {
  photos: SignedPhoto[];
  childName: string;
};

export default function AdminPhotoGallery({ photos, childName }: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [downloadingSingle, setDownloadingSingle] = useState<Record<string, boolean>>({});
  const [downloadingAll, setDownloadingAll] = useState(false);

  // Keyboard navigation for the lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === "Escape") setSelectedIdx(null);
      if (e.key === "ArrowRight") {
        setSelectedIdx((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
      }
      if (e.key === "ArrowLeft") {
        setSelectedIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
      }
    },
    [selectedIdx, photos.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    if (selectedIdx !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIdx, handleKeyDown]);

  const downloadImage = async (url: string, filename: string, key: string) => {
    setDownloadingSingle((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Falha ao baixar imagem via Blob, abrindo em nova guia:", error);
      window.open(url, "_blank");
    } finally {
      setDownloadingSingle((prev) => ({ ...prev, [key]: false }));
    }
  };

  const downloadAll = async () => {
    setDownloadingAll(true);
    const sanitizedName = childName.trim().toLowerCase().replace(/\s+/g, "-");
    const validPhotos = photos.filter((p) => p.url);

    for (let i = 0; i < validPhotos.length; i++) {
      const photo = validPhotos[i];
      if (photo.url) {
        // A pequena espera entre downloads previne o bloqueio do navegador para múltiplos downloads automáticos
        if (i > 0) await new Promise((resolve) => setTimeout(resolve, 300));
        
        try {
          const res = await fetch(photo.url);
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `foto-${i + 1}-${sanitizedName}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        } catch (error) {
          window.open(photo.url, "_blank");
        }
      }
    }
    setDownloadingAll(false);
  };

  const availablePhotos = photos.filter((p) => p.url);

  if (photos.length === 0) {
    return <p className="text-sm text-dark/45 italic">Nenhuma foto enviada para este item.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Galeria com Ação de Download em Lote */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-primary/75 uppercase tracking-wide">
          Arquivos Originais (Sem Marca d&apos;água)
        </span>
        {availablePhotos.length > 0 && (
          <button
            type="button"
            onClick={downloadAll}
            disabled={downloadingAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-cream px-3 py-1.5 text-xs font-bold text-primary hover:border-primary hover:bg-gold/10 transition-colors disabled:opacity-50"
          >
            {downloadingAll ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Baixando...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Baixar Todas as Fotos ({availablePhotos.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Grid de Thumbnails */}
      <div className="flex flex-wrap gap-3.5">
        {photos.map((photo, index) => {
          if (!photo.url) {
            return (
              <div
                key={photo.key}
                className="flex h-36 w-36 items-center justify-center rounded-xl border border-dashed border-gold/40 bg-cream p-3 text-center text-xs text-dark/50"
              >
                Foto indisponível
              </div>
            );
          }

          return (
            <div
              key={photo.key}
              className="group relative h-36 w-36 cursor-pointer overflow-hidden rounded-xl border border-gold/30 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
            >
              {/* Thumbnail (com marca d'água para visualização inicial no painel, seguindo boas práticas de segurança LGPD) */}
              <Image
                src={`/api/watermark?key=${encodeURIComponent(photo.key)}`}
                alt={`Foto ${index + 1} de ${childName}`}
                fill
                sizes="144px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
              
              {/* Hover overlay com botão de expandir e baixar */}
              <div 
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2"
                onClick={() => setSelectedIdx(index)}
              >
                <span className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors" title="Ampliar imagem">
                  <ZoomIn className="h-4.5 w-4.5" />
                </span>
                <button
                  type="button"
                  title="Baixar original"
                  className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (photo.url) {
                      downloadImage(
                        photo.url,
                        `foto-${index + 1}-${childName.trim().toLowerCase().replace(/\s+/g, "-")}.jpg`,
                        photo.key
                      );
                    }
                  }}
                  disabled={downloadingSingle[photo.key]}
                >
                  {downloadingSingle[photo.key] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal (z-50) */}
      {selectedIdx !== null && photos[selectedIdx] && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 animate-fade-in"
          onClick={() => setSelectedIdx(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* Top Bar do Modal */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
            <span className="text-sm font-semibold tracking-wider bg-black/50 px-3 py-1 rounded-full">
              Foto {selectedIdx + 1} de {photos.length} · {childName}
            </span>
            <div className="flex items-center gap-3">
              {photos[selectedIdx].url && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const photo = photos[selectedIdx];
                    if (photo.url) {
                      downloadImage(
                        photo.url,
                        `foto-${selectedIdx + 1}-${childName.trim().toLowerCase().replace(/\s+/g, "-")}.jpg`,
                        photo.key
                      );
                    }
                  }}
                  disabled={downloadingSingle[photos[selectedIdx].key]}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:scale-95 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-all"
                >
                  {downloadingSingle[photos[selectedIdx].key] ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  <span>Baixar Original</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedIdx(null)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
                aria-label="Fechar galeria"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navegação e Área Principal da Imagem */}
          <div className="relative flex w-full max-w-5xl items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* Navegação Esquerda */}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1))
                }
                className="absolute left-0 z-10 m-2 rounded-full bg-black/50 p-3 text-white hover:bg-black/80 transition-colors lg:-left-16"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Imagem Ampliada (unwatermarked original URL) */}
            <div className="relative max-h-[80vh] w-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[selectedIdx].url || ""}
                alt={`Visualização original da foto ${selectedIdx + 1}`}
                className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-2xl border border-white/10"
              />
            </div>

            {/* Navegação Direita */}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedIdx((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-0 z-10 m-2 rounded-full bg-black/50 p-3 text-white hover:bg-black/80 transition-colors lg:-right-16"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
          
          {/* Instruções / Legenda Inferior */}
          <p className="absolute bottom-4 text-xs text-white/50 bg-black/50 px-3 py-1 rounded-full" onClick={(e) => e.stopPropagation()}>
            Navegue usando as setas do teclado ou clique nas laterais. Pressione ESC para fechar.
          </p>
        </div>
      )}
    </div>
  );
}
