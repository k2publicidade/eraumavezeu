"use client";

import { forwardRef } from "react";

type PageProps = {
  children: React.ReactNode;
  bg?: string;
  className?: string;
};

export const FlipPage = forwardRef<HTMLDivElement, PageProps>(
  function FlipPage({ children, bg, className }, ref) {
    return (
      <div
        ref={ref}
        className={`w-full h-full ${bg ?? "bg-white"} shadow-inner ${
          className ?? ""
        }`}
      >
        <div className="w-full h-full p-8 md:p-10 flex flex-col">
          {children}
        </div>
      </div>
    );
  },
);

export const FlipPageHard = forwardRef<HTMLDivElement, PageProps>(
  function FlipPageHard({ children, bg, className }, ref) {
    return (
      <div
        ref={ref}
        data-density="hard"
        className={`w-full h-full ${bg ?? "bg-primary"} text-cream ${
          className ?? ""
        }`}
      >
        <div className="w-full h-full p-8 md:p-10 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      </div>
    );
  },
);

export const SAMPLE_PAGES = [
  {
    kind: "hard" as const,
    bg: "bg-gradient-to-br from-primary to-primary-dark",
    content: (
      <>
        <p className="font-script text-2xl text-gold-warm/90">Era uma vez…</p>
        <h1 className="font-serif text-4xl md:text-5xl text-cream mt-4 leading-tight">
          Sofia e a<br />
          Floresta Encantada
        </h1>
        <div className="mt-8 text-6xl" aria-hidden>
          🌳✨
        </div>
        <p className="font-serif text-cream/75 mt-10 text-sm">
          Uma história personalizada de{" "}
          <span className="font-script text-lg text-gold-warm">Era Uma Vez Eu</span>
        </p>
      </>
    ),
  },
  {
    kind: "soft" as const,
    bg: "bg-cream",
    content: (
      <>
        <p className="font-script text-xl text-primary mb-4">
          Para a minha filha Sofia, que transforma cada dia em uma nova aventura.
        </p>
        <p className="font-script text-sm text-dark/55 text-right">— Mamãe</p>
        <div className="mt-auto text-center text-dark/35 text-xs uppercase tracking-wide">
          Dedicatória
        </div>
      </>
    ),
  },
  {
    kind: "soft" as const,
    bg: "bg-gradient-to-b from-forest/5 to-forest/10",
    content: (
      <>
        <div className="text-center text-7xl mb-6" aria-hidden>
          🦋
        </div>
        <p className="font-serif text-lg text-primary/85 leading-relaxed">
          Numa manhã de sol, <strong>Sofia</strong> encontrou uma borboleta
          dourada na janela do seu quarto. "Venha, Sofia", disse a borboleta,
          "a floresta está esperando por você."
        </p>
        <p className="text-right text-dark/35 text-xs mt-auto">— 1 —</p>
      </>
    ),
  },
  {
    kind: "soft" as const,
    bg: "bg-gradient-to-br from-forest/8 to-forest/15",
    content: (
      <>
        <div className="text-center text-7xl mb-6" aria-hidden>
          🌲🌿
        </div>
        <p className="font-serif text-lg text-primary/85 leading-relaxed">
          Sofia seguiu a borboleta por entre as árvores. Cada folha brilhava
          como se tivesse vida própria, e o vento cantava canções antigas que
          só as crianças conseguem ouvir.
        </p>
        <p className="text-right text-dark/35 text-xs mt-auto">— 2 —</p>
      </>
    ),
  },
  {
    kind: "soft" as const,
    bg: "bg-gradient-to-b from-gold/8 to-fox/10",
    content: (
      <>
        <div className="text-center text-7xl mb-6" aria-hidden>
          🦊
        </div>
        <p className="font-serif text-lg text-primary/85 leading-relaxed">
          No coração da floresta, uma raposa ruiva apareceu. "Preciso da sua
          coragem, Sofia", disse ela. "A árvore mais antiga da floresta está
          triste — e só você pode fazer ela sorrir de novo."
        </p>
        <p className="text-right text-dark/35 text-xs mt-auto">— 3 —</p>
      </>
    ),
  },
  {
    kind: "soft" as const,
    bg: "bg-gradient-to-b from-rose-pale to-rose/10",
    content: (
      <>
        <div className="text-center text-7xl mb-6" aria-hidden>
          🌳💜
        </div>
        <p className="font-serif text-lg text-primary/85 leading-relaxed">
          Sofia abraçou a árvore antiga e sussurrou no ouvido dela uma canção
          que aprendeu com a vovó. A árvore suspirou, e de cada galho brotou
          uma flor roxa, a cor favorita da Sofia.
        </p>
        <p className="text-right text-dark/35 text-xs mt-auto">— 4 —</p>
      </>
    ),
  },
  {
    kind: "soft" as const,
    bg: "bg-gradient-to-br from-cream to-gold/10",
    content: (
      <>
        <div className="text-center text-7xl mb-6" aria-hidden>
          ✨🏡
        </div>
        <p className="font-serif text-lg text-primary/85 leading-relaxed">
          A floresta toda cantou pra Sofia. E quando ela voltou pra casa, no
          bolso do casaco, havia uma florzinha roxa — pra lembrar que a coragem
          dela tinha poder de transformar qualquer tristeza em flor.
        </p>
        <p className="text-right text-dark/35 text-xs mt-auto">— 5 —</p>
      </>
    ),
  },
  {
    kind: "hard" as const,
    bg: "bg-gradient-to-br from-forest to-primary-dark",
    content: (
      <>
        <p className="font-script text-3xl md:text-4xl text-gold-warm">Fim</p>
        <p className="font-serif text-cream/75 mt-6 text-sm max-w-xs">
          Cada página é ilustrada do zero pela nossa equipe a partir das suas
          escolhas e da foto da criança.
        </p>
        <div className="mt-8 text-gold-warm/80 font-serif text-lg">
          Era Uma Vez Eu
        </div>
      </>
    ),
  },
];
