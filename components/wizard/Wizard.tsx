"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/cart/store";
import { useWizardStore } from "@/lib/wizard/store";
import {
  AGE_RANGES,
  ART_STYLES,
  COLORS,
  GENRES,
  THEMES,
} from "@/lib/wizard/types";
import ChoiceGrid from "./ChoiceGrid";
import PhotoStep from "./PhotoStep";
import WizardProgress from "./WizardProgress";
import { gerarPromptIA } from "@/lib/wizard/prompt";

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export default function Wizard() {
  const hydrated = useHydrated();
  const state = useWizardStore();
  const searchParams = useSearchParams();

  const isCustomActive = state.theme === "" || (state.theme !== null && !THEMES.some((t) => t.slug === state.theme));

  // Pre-select theme if passed via query parameter (e.g. ?theme=dinossauros)
  useEffect(() => {
    if (!hydrated) return;
    const themeParam = searchParams.get("theme");
    if (themeParam) {
      const trimmed = themeParam.trim();
      if (trimmed) {
        const found = THEMES.find((t) => t.slug.toLowerCase() === trimmed.toLowerCase());
        state.setTheme(found ? found.slug : trimmed);
        // Advance to step 2 if we are currently on the theme step
        if (state.step === 1) {
          state.setStep(2);
        }
      }
    }
  }, [hydrated, searchParams, state]);

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined" || !("gtag" in window)) return;
    // Vercel Analytics pega via script — mas marcamos um evento custom
    // de abandono por passo via console quando dev (implementação real
    // plug-and-play com @vercel/analytics no layout).
  }, [hydrated, state.step]);

  if (!hydrated) {
    return (
      <div className="text-center py-20 text-dark/60">Carregando wizard…</div>
    );
  }

  const canNext = computeCanNext(state);

  const promptPreview = (() => {
    if (
      !state.theme ||
      !state.genre ||
      !state.artStyle ||
      !state.favoriteColor ||
      !state.ageRange ||
      !state.childName.trim()
    )
      return null;
    try {
      return gerarPromptIA({
        theme: state.theme,
        genre: state.genre,
        artStyle: state.artStyle,
        favoriteColor: state.favoriteColor,
        ageRange: state.ageRange,
        childName: state.childName,
        dedication: state.dedication,
        photoCount: state.photos.length,
      });
    } catch {
      return null;
    }
  })();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <WizardProgress current={state.step} />

      <div className="bg-cream-light rounded-3xl p-6 md:p-10 shadow-sm border border-gold/25">
        {state.step === 1 && (
          <StepShell
            title="Qual o tema da história?"
            subtitle="Escolha o universo onde a aventura vai acontecer."
          >
            <div className="mb-6 rounded-2xl border border-gold/35 bg-gold/10 px-5 py-4 text-sm leading-relaxed text-dark/75" role="note">
              <p className="font-semibold text-primary">Atenção sobre personagens protegidos</p>
              <p className="mt-2">
                Não trabalhamos com personagens registrados por outras empresas (Elsa, Mickey,
                Homem-Aranha etc.), pois são protegidos por direitos autorais e não podem ser
                reproduzidos em produtos à venda.
              </p>
              <p className="mt-2">
                Mas a magia continua: criamos personagens originais inspirados no que seu filho
                ama — uma princesa do gelo só dele, um herói aranha exclusivo — ou usamos os
                clássicos livres, como Chapeuzinho, Cinderela, dragões, fadas e piratas.
              </p>
            </div>
            <ChoiceGrid
              options={[...THEMES, { slug: "outro", label: "Outro" }]}
              value={isCustomActive ? "outro" : state.theme}
              onChange={(v) => {
                if (v === "outro") {
                  state.setTheme("");
                } else {
                  state.setTheme(v);
                }
              }}
            />

            {isCustomActive && (
              <div className="mt-6 space-y-2 animate-fade-in">
                <label
                  htmlFor="custom-theme"
                  className="block text-xs font-semibold text-primary/80 uppercase tracking-wider"
                >
                  Digite o tema personalizado
                </label>
                <input
                  id="custom-theme"
                  type="text"
                  value={state.theme ?? ""}
                  onChange={(e) => state.setTheme(e.target.value)}
                  placeholder="Ex: Astronauta, Fundo do Mar, Dinossauros Espaciais..."
                  className="w-full min-h-11 rounded-xl border border-gold/35 bg-white px-3.5 py-2.5 text-sm text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  maxLength={100}
                />
              </div>
            )}
          </StepShell>
        )}

        {state.step === 2 && (
          <StepShell
            title="Qual o tipo de história?"
            subtitle="O gênero narrativo dá o tom da aventura."
          >
            <ChoiceGrid
              options={GENRES}
              value={state.genre}
              onChange={(v) => state.setGenre(v)}
            />
          </StepShell>
        )}

        {state.step === 3 && (
          <StepShell
            title="Qual o estilo visual?"
            subtitle="Como você quer que as ilustrações fiquem."
          >
            <ChoiceGrid
              options={ART_STYLES}
              value={state.artStyle}
              onChange={(v) => state.setArtStyle(v)}
              columns={2}
            />
          </StepShell>
        )}

        {state.step === 4 && (
          <StepShell
            title="Qual a cor favorita da criança?"
            subtitle="Vai ser a cor dominante da paleta."
          >
            <ChoiceGrid
              options={COLORS}
              value={state.favoriteColor}
              onChange={(v) => state.setColor(v)}
            />
          </StepShell>
        )}

        {state.step === 5 && (
          <StepShell
            title="Qual a faixa etária?"
            subtitle="Ajusta a complexidade da história."
          >
            <ChoiceGrid
              options={AGE_RANGES}
              value={state.ageRange}
              onChange={(v) => state.setAgeRange(v)}
              columns={2}
            />
          </StepShell>
        )}

        {state.step === 6 && (
          <StepShell
            title="Nome e fotos da criança"
            subtitle="As fotos servem apenas como referência para as ilustrações."
          >
            <PhotoStep />
          </StepShell>
        )}

        {state.step === 6 && (
          <StepShell
            title="Nome e fotos da criança"
            subtitle="As fotos servem apenas como referência para as ilustrações."
          >
            <PhotoStep />

            <div className="mt-8 space-y-6">
              <details className="bg-cream rounded-2xl border border-gold/25 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-medium text-primary hover:bg-gold/10 transition-colors duration-200">
                  Ver resumo da personalização
                </summary>
                <div className="px-6 pb-5 text-sm text-dark/75 space-y-2 border-t border-gold/15 pt-4">
                  <p>Nome: <strong className="text-primary">{state.childName || "(vazio)"}</strong></p>
                  <p>Tema: {state.theme ?? "—"}</p>
                  <p>Gênero: {state.genre ?? "—"}</p>
                  <p>Estilo: {state.artStyle ?? "—"}</p>
                  <p>Cor: {state.favoriteColor ?? "—"}</p>
                  <p>Faixa etária: {state.ageRange ?? "—"}</p>
                  <p>Fotos: {state.photos.length}/4</p>
                </div>
              </details>

              {promptPreview && (
                <details className="bg-primary text-cream/90 rounded-2xl overflow-hidden">
                  <summary className="cursor-pointer px-6 py-4 font-medium hover:bg-primary-light transition-colors duration-200">
                    Prévia do prompt IA (equipe)
                  </summary>
                  <pre className="px-6 pb-5 text-xs whitespace-pre-wrap font-mono border-t border-cream/10 pt-4">
                    {promptPreview}
                  </pre>
                </details>
              )}
            </div>
          </StepShell>
        )}

        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => state.prev()}
            disabled={state.step === 1}
            className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Voltar
          </button>

          {state.step < 6 ? (
            <button
              type="button"
              onClick={() => state.next()}
              disabled={!canNext}
              className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              Próximo →
            </button>
          ) : (
            <FinishButton />
          )}
        </div>
      </div>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl md:text-3xl text-primary">{title}</h2>
      <p className="mt-2 text-dark/55 mb-8 leading-relaxed">{subtitle}</p>
      {children}
    </div>
  );
}

function FinishButton() {
  const router = useRouter();
  const state = useWizardStore();
  const addItem = useCartStore((s) => s.addItem);
  const complete = computeCanNext({ ...state, step: 6 });

  return (
    <button
      type="button"
      disabled={!complete}
      className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
      onClick={() => {
        addItem({
          id: `livro-personalizado-${state.childName.trim().toLowerCase().replace(/\s+/g, "-")}`,
          slug: "livro-principal-capa-dura",
          name: `Livro personalizado — ${state.childName.trim()}`,
          type: "LIVRO_PRINCIPAL",
          price: 249.9,
          // snapshot completo viaja com o item; createOrder revalida e persiste
          customization: {
            theme: state.theme!,
            genre: state.genre!,
            artStyle: state.artStyle!,
            favoriteColor: state.favoriteColor!,
            ageRange: state.ageRange!,
            childName: state.childName.trim(),
            dedication: state.dedication,
            photoKeys: state.photos.map((p) => p.fileKey),
            consentAcceptedAt: state.consentAcceptedAt!,
            consentTextVersion: state.consentTextVersion,
          },
        });
        router.push("/carrinho");
      }}
    >
      Finalizar →
    </button>
  );
}

function computeCanNext(s: {
  step: number;
  theme: string | null;
  genre: string | null;
  artStyle: string | null;
  favoriteColor: string | null;
  ageRange: string | null;
  childName: string;
  photos: unknown[];
  consentAcceptedAt: string | null;
  dedication: string;
}): boolean {
  switch (s.step) {
    case 1:
      return s.theme !== null && s.theme.trim().length >= 2;
    case 2:
      return s.genre !== null;
    case 3:
      return s.artStyle !== null;
    case 4:
      return s.favoriteColor !== null;
    case 5:
      return s.ageRange !== null;
    case 6:
      return (
        s.theme !== null &&
        s.theme.trim().length >= 2 &&
        s.genre !== null &&
        s.artStyle !== null &&
        s.favoriteColor !== null &&
        s.ageRange !== null &&
        s.childName.trim().length >= 2 &&
        s.consentAcceptedAt !== null &&
        s.photos.length >= 1
      );
    default:
      return false;
  }
}
