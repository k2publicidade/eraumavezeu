"use client";

import { useEffect, useState } from "react";
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

  return (
    <div className="max-w-2xl mx-auto">
      <WizardProgress current={state.step} />

      <div className="bg-cream-light rounded-3xl p-6 md:p-10 shadow-sm border border-gold/25">
        {state.step === 1 && (
          <StepShell
            title="Qual o tema da história?"
            subtitle="Escolha o universo onde a aventura vai acontecer."
          >
            <ChoiceGrid
              options={THEMES}
              value={state.theme}
              onChange={(v) => state.setTheme(v)}
            />
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

        {state.step === 7 && (
          <StepShell
            title="Dedicatória e revisão"
            subtitle="A dedicatória é impressa na primeira página em caligrafia."
          >
            <DedicationReview />
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

          {state.step < 7 ? (
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

function DedicationReview() {
  const state = useWizardStore();
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
    <div className="space-y-6">
      <div>
        <label
          htmlFor="dedication"
          className="block font-medium text-primary mb-2"
        >
          Dedicatória{" "}
          <span className="font-normal text-dark/50 text-sm">(opcional, máx. 300 caracteres)</span>
        </label>
        <textarea
          id="dedication"
          value={state.dedication}
          onChange={(e) => state.setDedication(e.target.value.slice(0, 300))}
          rows={4}
          placeholder="Para a minha filha Sofia, que transforma todo dia em aventura…"
          className="input-field font-script text-lg placeholder:font-sans placeholder:text-sm"
        />
        <p className="text-xs text-dark/45 mt-1 text-right">
          {state.dedication.length}/300
        </p>
      </div>

      {state.dedication && (
        <div className="bg-cream rounded-2xl p-6 border border-gold/30 shadow-xs">
          <p className="text-xs text-dark/50 mb-3 uppercase tracking-wide font-medium">
            Preview da página de rosto
          </p>
          <p className="font-script text-2xl text-primary leading-snug">
            {state.dedication}
          </p>
        </div>
      )}

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
  );
}

function FinishButton() {
  const state = useWizardStore();
  const complete = computeCanNext({ ...state, step: 7 });

  return (
    <button
      type="button"
      disabled={!complete}
      className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
      onClick={() => {
        // Phase 3 vai implementar: persistir customization + adicionar ao carrinho.
        // Por ora, só sinaliza pro usuário que o wizard está completo.
        alert(
          "Personalização completa! O carrinho será habilitado na próxima fase.",
        );
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
      return s.theme !== null;
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
        s.childName.trim().length >= 2 &&
        s.consentAcceptedAt !== null &&
        s.photos.length >= 1
      );
    case 7:
      return (
        s.theme !== null &&
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
