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

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-primary/10">
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
            className="px-6 py-3 rounded-full border-2 border-primary/20 text-dark/70 hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Voltar
          </button>

          {state.step < 7 ? (
            <button
              type="button"
              onClick={() => state.next()}
              disabled={!canNext}
              className="px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-dark disabled:bg-primary/30 disabled:cursor-not-allowed transition"
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
      <h2 className="font-serif text-2xl md:text-3xl text-dark">{title}</h2>
      <p className="mt-2 text-dark/60 mb-8">{subtitle}</p>
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
          className="block font-medium text-dark mb-2"
        >
          Dedicatória (opcional, máx. 300 caracteres)
        </label>
        <textarea
          id="dedication"
          value={state.dedication}
          onChange={(e) => state.setDedication(e.target.value.slice(0, 300))}
          rows={4}
          placeholder="Para a minha filha Sofia, que transforma todo dia em aventura…"
          className="w-full px-4 py-3 rounded-xl border-2 border-primary/20 bg-white focus:border-primary focus:outline-none"
        />
        <p className="text-xs text-dark/50 mt-1">
          {state.dedication.length}/300
        </p>
      </div>

      {state.dedication && (
        <div className="bg-light rounded-2xl p-6 border border-primary/10">
          <p className="text-xs text-dark/60 mb-2">Preview da página de rosto</p>
          <p className="font-script text-2xl text-secondary leading-snug">
            {state.dedication}
          </p>
        </div>
      )}

      <details className="bg-light rounded-2xl border border-primary/10 overflow-hidden">
        <summary className="cursor-pointer px-6 py-4 font-medium text-dark">
          Ver resumo da personalização
        </summary>
        <div className="px-6 pb-5 text-sm text-dark/80 space-y-1">
          <p>Nome: <strong>{state.childName || "(vazio)"}</strong></p>
          <p>Tema: {state.theme ?? "—"}</p>
          <p>Gênero: {state.genre ?? "—"}</p>
          <p>Estilo: {state.artStyle ?? "—"}</p>
          <p>Cor: {state.favoriteColor ?? "—"}</p>
          <p>Faixa etária: {state.ageRange ?? "—"}</p>
          <p>Fotos: {state.photos.length}/4</p>
        </div>
      </details>

      {promptPreview && (
        <details className="bg-dark text-light/90 rounded-2xl overflow-hidden">
          <summary className="cursor-pointer px-6 py-4 font-medium">
            Prévia do prompt IA (equipe)
          </summary>
          <pre className="px-6 pb-5 text-xs whitespace-pre-wrap font-mono">
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
      className="px-8 py-3 rounded-full bg-secondary text-white font-medium hover:opacity-90 disabled:bg-secondary/30 disabled:cursor-not-allowed transition"
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
