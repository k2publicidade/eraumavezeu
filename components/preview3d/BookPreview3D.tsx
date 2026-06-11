"use client";

// ============================================================
// Card da prévia 3D — lê o store do wizard e atualiza ao vivo.
// O Canvas Three.js entra via dynamic import (ssr:false) com
// skeleton de carregamento e fallback 2D se WebGL falhar.
// ============================================================

import dynamic from "next/dynamic";
import { Component, useState, type ReactNode } from "react";
import { useWizardStore } from "@/lib/wizard/store";
import { cn } from "@/lib/utils";
import { resolveCoverColor, shade } from "./coverArt";

const Book3D = dynamic(() => import("./Book3D"), {
  ssr: false,
  loading: () => <CanvasSkeleton />,
});

function CanvasSkeleton() {
  return (
    <div className="h-full w-full animate-pulse flex flex-col items-center justify-center gap-3">
      <div className="w-32 h-44 rounded-lg bg-gold/20 border border-gold/30" />
      <p className="text-xs text-dark/40">Preparando a prévia 3D…</p>
    </div>
  );
}

/** Fallback 2D caso o WebGL não esteja disponível no dispositivo. */
function StaticFallback({ colorSlug, childName }: { colorSlug: string | null; childName: string }) {
  const base = resolveCoverColor(colorSlug);
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div
        className="w-44 h-60 rounded-r-lg rounded-l-sm shadow-lg border-2 flex flex-col items-center justify-center gap-2 px-4 text-center"
        style={{
          background: `linear-gradient(180deg, ${shade(base, 0.1)}, ${shade(base, -0.25)})`,
          borderColor: "#E8C94A",
        }}
      >
        <p className="text-[10px] tracking-widest text-gold-light">ERA UMA VEZ</p>
        <p className="font-serif text-xl text-cream-light break-words w-full">
          {childName.trim() || "Eu"}
        </p>
        <p className="text-[10px] text-cream/70">✦ era uma vez eu ✦</p>
      </div>
    </div>
  );
}

class WebGLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function BookPreview3D({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const theme = useWizardStore((s) => s.theme);
  const favoriteColor = useWizardStore((s) => s.favoriteColor);
  const childName = useWizardStore((s) => s.childName);
  const dedication = useWizardStore((s) => s.dedication);

  return (
    <div
      className={cn(
        "rounded-3xl border border-gold/25 bg-cream-radial bg-cream shadow-sm overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-dark/50">
          Prévia 3D do seu livro
        </p>
        <span className="text-xs rounded-full bg-gold/25 text-primary px-2.5 py-0.5 font-medium">
          ao vivo ✨
        </span>
      </div>

      <div className="h-[360px] lg:h-[430px]">
        <WebGLBoundary fallback={<StaticFallback colorSlug={favoriteColor} childName={childName} />}>
          <Book3D
            colorSlug={favoriteColor}
            themeSlug={theme}
            childName={childName}
            dedication={dedication}
            open={open}
            onToggle={() => setOpen((o) => !o)}
          />
        </WebGLBoundary>
      </div>

      <div className="px-5 pb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-pressed={open}
          className="btn-ghost text-sm px-4 py-2"
        >
          {open ? "Fechar o livro" : "Abrir o livro 📖"}
        </button>
        <p className="text-xs text-dark/45" aria-hidden="true">
          Arraste para girar
        </p>
      </div>

      <p className="px-5 pb-4 text-[11px] leading-snug text-dark/40">
        Prévia ilustrativa — a capa final é produzida pela nossa equipe com as ilustrações
        exclusivas do seu pedido.
      </p>
    </div>
  );
}
