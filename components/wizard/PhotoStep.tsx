"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing-client";
import { useWizardStore } from "@/lib/wizard/store";
import {
  CONSENT_TEXT,
  MAX_PHOTOS,
  type UploadedPhoto,
} from "@/lib/wizard/types";

export default function PhotoStep() {
  const childName = useWizardStore((s) => s.childName);
  const setChildName = useWizardStore((s) => s.setChildName);
  const photos = useWizardStore((s) => s.photos);
  const addPhoto = useWizardStore((s) => s.addPhoto);
  const removePhoto = useWizardStore((s) => s.removePhoto);
  const consentAcceptedAt = useWizardStore((s) => s.consentAcceptedAt);
  const acceptConsent = useWizardStore((s) => s.acceptConsent);
  const revokeConsent = useWizardStore((s) => s.revokeConsent);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const remaining = MAX_PHOTOS - photos.length;
  const canUpload = consentAcceptedAt !== null;

  return (
    <div className="space-y-8">
      <div>
        <label
          htmlFor="childName"
          className="block font-medium text-dark mb-2"
        >
          Nome da criança
        </label>
        <input
          id="childName"
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          maxLength={30}
          placeholder="Ex.: Sofia"
          className="w-full px-4 py-3 rounded-xl border-2 border-primary/20 bg-white focus:border-primary focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border-2 border-primary/20 bg-light p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentAcceptedAt !== null}
            onChange={(e) =>
              e.target.checked ? acceptConsent() : revokeConsent()
            }
            className="mt-1 h-5 w-5 accent-primary"
          />
          <span className="text-sm text-dark/80 leading-relaxed">
            {CONSENT_TEXT}
          </span>
        </label>
        {consentAcceptedAt && (
          <p className="mt-3 text-xs text-dark/50">
            Aceito em {new Date(consentAcceptedAt).toLocaleString("pt-BR")}.
            Você pode revogar a qualquer momento.
          </p>
        )}
      </div>

      <div>
        <h3 className="font-serif text-xl text-dark mb-2">
          Fotos da criança ({photos.length}/{MAX_PHOTOS})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="font-medium text-green-800 mb-1">✅ Foto boa</p>
            <p className="text-green-700/80">
              Rosto visível, boa iluminação, criança sozinha, sem objetos
              cobrindo o rosto.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="font-medium text-red-800 mb-1">❌ Evite</p>
            <p className="text-red-700/80">
              Foto escura, rosto cortado, óculos escuros, várias pessoas
              juntas.
            </p>
          </div>
        </div>

        {photos.length > 0 && (
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {photos.map((p) => (
              <li
                key={p.fileKey}
                className="relative aspect-square rounded-xl overflow-hidden border-2 border-primary/20 bg-white"
              >
                {/* Preview direto da URL Uploadthing — em produção, passar por /api/watermark */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remover ${p.name}`}
                  onClick={() => removePhoto(p.fileKey)}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-white/95 text-dark hover:bg-red-500 hover:text-white transition flex items-center justify-center text-sm font-bold shadow"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {canUpload && remaining > 0 && (
          <UploadDropzone
            endpoint="childPhoto"
            appearance={{
              container: "border-2 border-dashed border-primary/30 rounded-2xl",
              label: "text-primary font-medium",
              button:
                "bg-primary hover:bg-primary-dark ut-uploading:bg-primary-dark ut-ready:bg-primary",
            }}
            config={{ mode: "auto" }}
            onClientUploadComplete={(res) => {
              setUploadError(null);
              res.forEach((f) => {
                const p: UploadedPhoto = {
                  fileKey: f.serverData?.fileKey ?? f.key,
                  url: f.serverData?.url ?? f.ufsUrl ?? f.url,
                  name: f.serverData?.name ?? f.name,
                };
                addPhoto(p);
              });
            }}
            onUploadError={(err) => {
              setUploadError(err.message || "Falha no upload");
            }}
          />
        )}

        {!canUpload && (
          <p className="text-sm text-dark/60 italic">
            Aceite o termo acima para liberar o envio de fotos.
          </p>
        )}

        {remaining === 0 && (
          <p className="text-sm text-primary font-medium">
            Limite de {MAX_PHOTOS} fotos atingido.
          </p>
        )}

        {uploadError && (
          <p className="mt-3 text-sm text-red-600">{uploadError}</p>
        )}
      </div>
    </div>
  );
}
