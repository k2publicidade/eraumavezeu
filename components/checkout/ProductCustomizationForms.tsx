"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy, ImagePlus, LockKeyhole, Trash2 } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing-client";
import type { CartItem, ProductType } from "@/lib/cart/types";
import {
  ART_STYLE_OPTIONS,
  COLOR_SUGGESTIONS,
  CONFIDENTIALITY_TEXT,
  GENDER_OPTIONS,
  LINE_STYLE_OPTIONS,
  PRODUCT_FORM_LABELS,
  PRODUCT_FORM_VERSION,
  REQUIRED_PRODUCT_PHOTOS,
  consentTextFor,
  createCustomizationDraft,
  productCustomizationSchema,
  productNeedsArt,
  productNeedsStory,
  toCustomizationPayload,
  type ProductCustomizationDraft,
} from "@/lib/product-customization";

export type CustomizationUnit = {
  key: string;
  itemId: string;
  itemSlug: string;
  productName: string;
  productType: ProductType;
  unitIndex: number;
  draft: ProductCustomizationDraft;
};

export function buildCustomizationUnits(items: CartItem[]): CustomizationUnit[] {
  return items.flatMap((item) =>
    Array.from({ length: item.quantity }, (_, unitIndex) => ({
      key: `${item.id}:${unitIndex}`,
      itemId: item.id,
      itemSlug: item.slug,
      productName: item.name,
      productType: item.type,
      unitIndex,
      draft: createCustomizationDraft(item.type, unitIndex === 0 ? item.customization : undefined),
    })),
  );
}

type Props = {
  units: CustomizationUnit[];
  onChange: (units: CustomizationUnit[]) => void;
  showErrors: boolean;
};

const fieldClass =
  "mt-1.5 min-h-11 w-full rounded-xl border border-gold/35 bg-white px-3.5 py-2.5 text-sm text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export default function ProductCustomizationForms({ units, onChange, showErrors }: Props) {
  const [uploadError, setUploadError] = useState<Record<string, string>>({});

  function updateUnit(key: string, patch: Partial<ProductCustomizationDraft>) {
    onChange(units.map((unit) => unit.key === key ? { ...unit, draft: { ...unit.draft, ...patch } } : unit));
  }

  function copyFirstToAll() {
    const source = units[0]?.draft;
    if (!source) return;
    onChange(units.map((unit, index) => index === 0 ? unit : {
      ...unit,
      draft: {
        ...unit.draft,
        childName: source.childName,
        childAge: source.childAge,
        childGender: source.childGender,
        favoriteColor: source.favoriteColor,
        theme: source.theme,
        notes: source.notes,
        photoKeys: [...source.photoKeys],
        photoUrls: [...source.photoUrls],
        consentAcceptedAt: source.consentAcceptedAt,
        consentTextVersion: PRODUCT_FORM_VERSION,
        confidentialityAcceptedAt: source.confidentialityAcceptedAt,
      },
    }));
  }

  return (
    <section aria-labelledby="customization-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-forest">Etapa 1 de 2</p>
          <h1 id="customization-title" className="mt-1 font-serif text-3xl text-primary md:text-4xl">
            Conte como cada presente será criado
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dark/70">
            Cada unidade recebe uma ficha de produção própria. Assim, nomes, preferências e fotos chegam organizados para a equipe, sem depender de formulários externos.
          </p>
        </div>
        {units.length > 1 && (
          <button type="button" onClick={copyFirstToAll} className="btn-ghost shrink-0 justify-center">
            <Copy className="h-4 w-4" aria-hidden />
            Reutilizar dados da primeira ficha
          </button>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {units.map((unit, index) => {
          const parsed = productCustomizationSchema.safeParse(toCustomizationPayload(unit.draft));
          const errors = parsed.success ? {} : parsed.error.flatten().fieldErrors;
          const complete = parsed.success;
          const title = PRODUCT_FORM_LABELS[unit.productType].title;

          return (
            <details key={unit.key} open={index === 0 || (showErrors && !complete)} className="group overflow-hidden rounded-2xl border border-gold/30 bg-cream-light">
              <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3 sm:px-6">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${complete ? "bg-forest text-white" : "bg-primary/8 text-primary"}`}>
                  {complete ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-pretty font-medium leading-snug text-primary">{title}</span>
                  <span className="block text-xs text-dark/55">
                    {unit.productName}{units.filter((x) => x.itemId === unit.itemId).length > 1 ? `, unidade ${unit.unitIndex + 1}` : ""}
                  </span>
                </span>
                <span className={`hidden text-xs font-medium sm:block ${complete ? "text-forest" : "text-dark/50"}`}>
                  {complete ? "Ficha completa" : "Preenchimento pendente"}
                </span>
                <ChevronDown className="h-5 w-5 text-primary transition-transform group-open:rotate-180" aria-hidden />
              </summary>

              <div className="border-t border-gold/20 px-4 py-6 sm:px-6 sm:py-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nome completo da criança" error={showErrors ? errors.childName?.[0] : undefined}>
                    <input value={unit.draft.childName} onChange={(e) => updateUnit(unit.key, { childName: e.target.value })} className={fieldClass} autoComplete="off" placeholder="Ex.: Sofia Almeida" maxLength={80} />
                  </Field>
                  <Field label="Idade" error={showErrors ? errors.childAge?.[0] : undefined}>
                    <input value={unit.draft.childAge ?? ""} onChange={(e) => updateUnit(unit.key, { childAge: e.target.value === "" ? null : Number(e.target.value) })} className={fieldClass} type="number" min={0} max={17} inputMode="numeric" placeholder="Ex.: 6" />
                  </Field>
                </div>

                <ChoiceGroup label="Como a criança se identifica?" value={unit.draft.childGender} options={GENDER_OPTIONS} onChange={(childGender) => updateUnit(unit.key, { childGender: childGender as ProductCustomizationDraft["childGender"] })} />

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Cor favorita" hint="Você pode escolher uma sugestão ou escrever outra." error={showErrors ? errors.favoriteColor?.[0] : undefined}>
                    <input list={`colors-${unit.key}`} value={unit.draft.favoriteColor} onChange={(e) => updateUnit(unit.key, { favoriteColor: e.target.value })} className={fieldClass} placeholder="Ex.: Azul" maxLength={40} />
                    <datalist id={`colors-${unit.key}`}>{COLOR_SUGGESTIONS.map((color) => <option key={color} value={color} />)}</datalist>
                  </Field>
                  <Field label="Tema que mais encanta a criança" hint="Dinossauros, natureza, princesas, robôs ou uma ideia própria." error={showErrors ? errors.theme?.[0] : undefined}>
                    <input value={unit.draft.theme} onChange={(e) => updateUnit(unit.key, { theme: e.target.value })} className={fieldClass} placeholder="Ex.: Fundo do mar e tartarugas" maxLength={180} />
                  </Field>
                </div>

                {productNeedsStory(unit.productType) && (
                  <div className="mt-5">
                    <Field label="Gênero da história" hint="Aventura, comédia, mistério, conto de fadas ou outro." error={showErrors ? errors.storyGenre?.[0] : undefined}>
                      <input value={unit.draft.storyGenre} onChange={(e) => updateUnit(unit.key, { storyGenre: e.target.value })} className={fieldClass} placeholder="Ex.: Aventura com humor" maxLength={100} />
                    </Field>
                  </div>
                )}

                {productNeedsArt(unit.productType) && (
                  <ChoiceGroup label={unit.productType === "QUEBRA_CABECA" ? "Estilo da imagem" : "Estilo das ilustrações"} value={unit.draft.artStyle} options={ART_STYLE_OPTIONS} error={showErrors ? errors.artStyle?.[0] : undefined} onChange={(artStyle) => updateUnit(unit.key, { artStyle })} />
                )}

                {unit.productType === "LIVRO_COLORIR" && (
                  <ChoiceGroup label="Tipo de traço" value={unit.draft.lineStyle} options={LINE_STYLE_OPTIONS} error={showErrors ? errors.lineStyle?.[0] : undefined} onChange={(lineStyle) => updateUnit(unit.key, { lineStyle })} />
                )}

                {(unit.productType === "LIVRO_PRINCIPAL" || unit.productType === "EBOOK") && (
                  <div className="mt-6">
                    <Field label="Dedicatória" hint="Recomendamos até dois parágrafos curtos." error={showErrors ? errors.dedication?.[0] : undefined}>
                      <textarea value={unit.draft.dedication} onChange={(e) => updateUnit(unit.key, { dedication: e.target.value })} className={fieldClass} rows={4} placeholder="Para você, que transforma cada dia em uma nova aventura..." maxLength={700} />
                    </Field>
                  </div>
                )}

                <div className="mt-6">
                  <Field label="Detalhes que tornam a criação mais fiel" hint="Conte sobre pets, hobbies, características marcantes ou escreva “Sem observações”." error={showErrors ? errors.notes?.[0] : undefined}>
                    <textarea value={unit.draft.notes} onChange={(e) => updateUnit(unit.key, { notes: e.target.value })} className={fieldClass} rows={4} placeholder="Ex.: Tem um cachorro chamado Pingo e adora andar de bicicleta." maxLength={1500} />
                  </Field>
                </div>

                <div className="mt-8 border-t border-gold/20 pt-7">
                  <div className="flex items-start gap-3">
                    <ImagePlus className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden />
                    <div>
                      <h3 className="font-medium text-primary">Quatro fotos de referência</h3>
                      <p className="mt-1 text-sm leading-relaxed text-dark/65">Envie rosto e corpo inteiro, com boa iluminação, em ângulos e expressões diferentes.</p>
                    </div>
                  </div>

                  <ConsentCheckbox checked={Boolean(unit.draft.consentAcceptedAt)} onChange={(checked) => updateUnit(unit.key, { consentAcceptedAt: checked ? new Date().toISOString() : "", consentTextVersion: PRODUCT_FORM_VERSION })} text={consentTextFor(unit.productType)} />

                  {unit.draft.photoKeys.length > 0 && (
                    <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {unit.draft.photoKeys.map((fileKey, photoIndex) => {
                        const photo = unit.draft.photoUrls.find((item) => item.fileKey === fileKey);
                        return (
                          <li key={fileKey} className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-gold/30 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {photo ? <img src={`/api/watermark?key=${encodeURIComponent(fileKey)}`} alt={`Foto ${photoIndex + 1} de ${unit.draft.childName || "referência"}, com marca d'água`} className="h-full w-full object-cover" /> : <span className="px-3 text-center text-xs text-dark/55">Foto {photoIndex + 1} já enviada</span>}
                            <button type="button" onClick={() => updateUnit(unit.key, { photoKeys: unit.draft.photoKeys.filter((key) => key !== fileKey), photoUrls: unit.draft.photoUrls.filter((item) => item.fileKey !== fileKey) })} aria-label={`Remover foto ${photoIndex + 1}`} className="absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-red-700 shadow-sm hover:bg-red-50">
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {unit.draft.consentAcceptedAt && unit.draft.photoKeys.length < REQUIRED_PRODUCT_PHOTOS && (
                    <div className="mt-4">
                      <UploadDropzone endpoint="childPhoto" appearance={{ container: "min-h-36 rounded-xl border-2 border-dashed border-gold/40 bg-white", label: "text-primary font-medium", button: "bg-primary text-white ut-ready:bg-primary ut-uploading:bg-primary-dark" }} config={{ mode: "auto" }} onClientUploadComplete={(files) => {
                        const added = files.map((file) => ({ fileKey: file.serverData?.fileKey ?? file.key, url: file.serverData?.url ?? file.ufsUrl ?? file.url, name: file.serverData?.name ?? file.name }));
                        const photoUrls = [...unit.draft.photoUrls, ...added].slice(0, REQUIRED_PRODUCT_PHOTOS);
                        const photoKeys = Array.from(new Set([...unit.draft.photoKeys, ...added.map((file) => file.fileKey)])).slice(0, REQUIRED_PRODUCT_PHOTOS);
                        updateUnit(unit.key, { photoKeys, photoUrls });
                        setUploadError((current) => ({ ...current, [unit.key]: "" }));
                      }} onUploadError={(error) => setUploadError((current) => ({ ...current, [unit.key]: error.message || "Não foi possível enviar as fotos." }))} />
                    </div>
                  )}
                  {!unit.draft.consentAcceptedAt && <p className="mt-4 rounded-xl bg-primary/5 px-4 py-3 text-sm text-primary">Aceite o termo para liberar o envio das fotos.</p>}
                  <p className={`mt-3 text-sm font-medium ${unit.draft.photoKeys.length === REQUIRED_PRODUCT_PHOTOS ? "text-forest" : "text-dark/55"}`}>{unit.draft.photoKeys.length} de {REQUIRED_PRODUCT_PHOTOS} fotos enviadas</p>
                  {(showErrors && errors.photoKeys?.[0]) && <p className="mt-1 text-sm text-red-700" role="alert">{errors.photoKeys[0]}</p>}
                  {uploadError[unit.key] && <p className="mt-2 text-sm text-red-700" role="alert">{uploadError[unit.key]}</p>}
                </div>

                <div className="mt-7 border-t border-gold/20 pt-6">
                  <ConsentCheckbox checked={Boolean(unit.draft.confidentialityAcceptedAt)} onChange={(checked) => updateUnit(unit.key, { confidentialityAcceptedAt: checked ? new Date().toISOString() : "" })} text={CONFIDENTIALITY_TEXT} icon="lock" />
                  {showErrors && errors.confidentialityAcceptedAt?.[0] && <p className="mt-1 text-sm text-red-700" role="alert">Confirme que leu o compromisso de confidencialidade.</p>}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-primary">{label}{hint && <span className="mt-0.5 block text-xs font-normal leading-relaxed text-dark/55">{hint}</span>}{children}{error && <span className="mt-1.5 block text-sm font-normal text-red-700" role="alert">{error}</span>}</label>;
}

function ChoiceGroup({ label, value, options, onChange, error }: { label: string; value: string; options: ReadonlyArray<{ value: string; label: string; description?: string }>; onChange: (value: string) => void; error?: string }) {
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-medium text-primary">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => <label key={option.value} className={`min-h-11 cursor-pointer rounded-xl border px-4 py-2.5 text-sm transition ${value === option.value ? "border-primary bg-primary text-white" : "border-gold/35 bg-white text-dark hover:border-primary/50"}`} title={option.description}>
          <input type="radio" className="sr-only" checked={value === option.value} onChange={() => onChange(option.value)} />{option.label}
        </label>)}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-700" role="alert">{error}</p>}
    </fieldset>
  );
}

function ConsentCheckbox({ checked, onChange, text, icon }: { checked: boolean; onChange: (checked: boolean) => void; text: string; icon?: "lock" }) {
  return (
    <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-gold/30 bg-white p-4">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-primary" />
      <span className="text-sm leading-relaxed text-dark/75">{icon && <LockKeyhole className="mr-2 inline h-4 w-4 text-forest" aria-hidden />}{text}</span>
    </label>
  );
}
