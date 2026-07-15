"use client";

import { useRef, useState } from "react";

export type PrivateUploadedPhoto = { fileKey: string; url: string; name: string };

export default function PrivatePhotoUploader({
  remaining,
  onUploaded,
  onError,
}: {
  remaining: number;
  onUploaded: (photos: PrivateUploadedPhoto[]) => void;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length || uploading) return;
    setUploading(true);
    onError("");
    try {
      const selected = Array.from(files).slice(0, remaining);
      const uploaded: PrivateUploadedPhoto[] = [];
      for (const file of selected) {
        const preparation = await fetch("/api/photos/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: file.type, size: file.size }),
        });
        const data = (await preparation.json()) as { fileKey?: string; uploadUrl?: string; error?: string };
        if (!preparation.ok || !data.fileKey || !data.uploadUrl) {
          throw new Error(data.error || "Não foi possível preparar o envio.");
        }
        const upload = await fetch(data.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type, "x-upsert": "false" },
          body: file,
        });
        if (!upload.ok) throw new Error("O armazenamento recusou a foto. Tente novamente.");
        uploaded.push({ fileKey: data.fileKey, url: `/api/watermark?key=${encodeURIComponent(data.fileKey)}`, name: file.name });
      }
      onUploaded(uploaded);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Falha no upload das fotos.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gold/40 bg-white p-5 text-center transition-colors hover:border-gold/70">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={remaining > 1}
        disabled={uploading}
        onChange={(event) => void uploadFiles(event.target.files)}
        className="sr-only"
        id="private-photo-upload"
      />
      <p className="text-sm font-medium text-primary">JPG, PNG ou WEBP, até 8 MB por foto</p>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="mt-3 min-h-11 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-primary-light disabled:cursor-wait disabled:opacity-60"
      >
        {uploading ? "Enviando com segurança…" : remaining > 1 ? "Escolher fotos" : "Escolher foto"}
      </button>
      <p aria-live="polite" className="mt-2 text-xs text-dark/55">
        {uploading ? "Mantenha esta página aberta durante o envio." : `${remaining} espaço${remaining === 1 ? "" : "s"} disponível${remaining === 1 ? "" : "is"}.`}
      </p>
    </div>
  );
}
