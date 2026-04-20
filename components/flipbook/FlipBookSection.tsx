"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";
import Link from "next/link";
import { SAMPLE_PAGES } from "./FlipBookPages";

const FlipBook = dynamic(() => import("./FlipBook"), {
  ssr: false,
  loading: () => (
    <div className="w-[420px] h-[560px] max-w-full mx-auto rounded-lg bg-white/80 border border-primary/10 animate-pulse" />
  ),
});

class FlipBookErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (typeof window !== "undefined") {
      console.warn("FlipBook fallback triggered:", error);
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function LinearFallback() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
      {SAMPLE_PAGES.map((page, i) => (
        <div
          key={i}
          className={`aspect-[3/4] rounded-xl p-4 ${page.bg ?? "bg-white"} border border-primary/10 overflow-hidden flex flex-col justify-end text-sm`}
        >
          <div className="text-white/80 text-xs font-medium">
            Página {i + 1}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FlipBookSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            Pré-visualização
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-dark">
            Como fica o livro da criança que você ama
          </h2>
          <p className="mt-3 text-dark/70">
            Arraste as páginas pra folhear. Cada livro é produzido do zero — as
            ilustrações abaixo são apenas um exemplo de layout.
          </p>
        </div>

        <FlipBookErrorBoundary fallback={<LinearFallback />}>
          <FlipBook />
        </FlipBookErrorBoundary>

        <div className="mt-10 text-center">
          <Link
            href="/personalizar"
            className="inline-block bg-primary text-white px-8 py-4 rounded-full hover:bg-primary-dark transition text-lg font-medium shadow-lg"
          >
            Criar o livro da minha família →
          </Link>
        </div>
      </div>
    </section>
  );
}
