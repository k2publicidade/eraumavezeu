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
          className="block font-medium text-primary mb-2"
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
          className="input-field"
        />
      </div>

      {/* Consentimento LGPD — destaque obrigatório, Art. 14 */}
      <div className="rounded-2xl border-2 border-gold/50 bg-cream p-6 shadow-xs">
        <p className="text-xs font-semibold text-forest uppercase tracking-wide mb-3">
          Termo de Consentimento LGPD
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentAcceptedAt !== null}
            onChange={(e) =>
              e.target.checked ? acceptConsent() : revokeConsent()
            }
            className="mt-1 h-5 w-5 accent-primary flex-shrink-0"
            aria-required="true"
            aria-describedby="consent-hint"
          />
          <span className="text-sm text-dark/80 leading-relaxed">
            {CONSENT_TEXT}
          </span>
        </label>
        {consentAcceptedAt ? (
          <p id="consent-hint" className="mt-3 text-xs text-forest/70">
            Aceito em {new Date(consentAcceptedAt).toLocaleString("pt-BR")}.
            Você pode revogar a qualquer momento desmarcando esta caixa.
          </p>
        ) : (
          <p id="consent-hint" className="mt-3 text-xs text-fox font-medium">
            Obrigatório para prosseguir com o envio de fotos.
          </p>
        )}
      </div>

      <div>
        <h3 className="font-serif text-xl text-primary mb-2">
          Fotos da criança ({photos.length}/{MAX_PHOTOS})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-forest/5 border border-forest/20 rounded-xl p-4">
            <p className="font-medium text-forest-dark mb-1">Foto ideal</p>
            <p className="text-forest-dark/70">
              Rosto visível, boa iluminação, criança sozinha, sem objetos
              cobrindo o rosto.
            </p>
          </div>
          <div className="bg-fox/5 border border-fox/20 rounded-xl p-4">
            <p className="font-medium text-fox-dark mb-1">Evite</p>
            <p className="text-fox-dark/70">
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
                className="relative aspect-square rounded-xl overflow-hidden border-2 border-gold/30 bg-cream"
              >
                {/* Preview com marca d'água via API para conformidade com LGPD */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/watermark?url=${encodeURIComponent(p.url)}`}
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
              container: "border-2 border-dashed border-gold/40 rounded-2xl bg-cream hover:border-gold/70 transition-colors",
              label: "text-primary font-medium",
              button:
                "bg-primary hover:bg-primary-light ut-uploading:bg-primary-dark ut-ready:bg-primary",
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
          <p className="text-sm text-dark/55 italic">
            Aceite o termo acima para liberar o envio de fotos.
          </p>
        )}

        {remaining === 0 && (
          <p className="text-sm text-forest font-medium">
            Limite de {MAX_PHOTOS} fotos atingido.
          </p>
        )}

        {uploadError && (
          <p className="mt-3 text-sm text-fox-dark font-medium">{uploadError}</p>
        )}
      </div>
    </div>
  );
}
