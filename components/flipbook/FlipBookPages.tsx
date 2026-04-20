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
        className={`w-full h-full ${bg ?? "bg-primary"} text-white ${
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
        <p className="font-script text-2xl text-white/80">Era uma vez…</p>
        <h1 className="font-serif text-4xl md:text-5xl text-white mt-4 leading-tight">
          Sofia e a<br />
          Floresta Encantada
        </h1>
        <div className="mt-8 text-6xl" aria-hidden>
          🌳✨
        </div>
        <p className="font-serif text-white/90 mt-10 text-sm">
          Uma história personalizada de{" "}
          <span className="font-script text-lg">Era Uma Vez Eu</span>
        </p>
      </>
    ),
  },
  {
    kind: "soft" as const,
    bg: "bg-light",
    content: (
      <>
        <p className="font-script text-xl text-secondary mb-4">
          Para a minha filha Sofia, que transforma cada dia em uma nova aventura.
        </p>
        <p className="font-script text-sm text-dark/60 text-right">— Mamãe</p>
        <div className="mt-auto text-center text-dark/40 text-xs">
          Dedicatória
        </div>
      </>
    ),
  },
  {
    kind: "soft" as const,
    bg: "bg-gradient-to-b from-green-50 to-green-100",
    content: (
      <>
        <div className="text-center text-7xl mb-6" aria-hidden>
          🦋
        </div>
        <p className="font-serif text-lg text-dark/85 leading-relaxed">
          Numa manhã de sol, <strong>Sofia</strong> encontrou uma borboleta
          dourada na janela do seu quarto. "Venha, Sofia", disse a borboleta,
          "a floresta está esperando por você."
        </p>
        <p className="text-right text-dark/40 text-xs mt-auto">— 1 —</p>
      </>
    ),
  },
  {
    kind: "soft" as const,
    bg: "bg-gradient-to-br from-green-100 to-emerald-200",
    content: (
      <>
        <div className="text-center text-7xl mb-6" aria-hidden>
          🌲🌿
        </div>
        <p className="font-serif text-lg text-dark/85 leading-relaxed">
          Sofia seguiu a borboleta por entre as árvores. Cada folha brilhava
          como se tivesse vida própria, e o vento cantava canções antigas que
          só as crianças conseguem ouvir.
        </p>
        <p className="text-right text-dark/40 text-xs mt-auto">— 2 —</p>
      </>
    ),
  },
  {
    kind: "soft" as const,
    bg: "bg-gradient-to-b from-amber-50 to-orange-100",
    content: (
      <>
        <div className="text-center text-7xl mb-6" aria-hidden>
          🦊
        </div>
        <p className="font-serif text-lg text-dark/85 leading-relaxed">
          No coração da floresta, uma raposa ruiva apareceu. "Preciso da sua
          coragem, Sofia", disse ela. "A árvore mais antiga da floresta está
          triste — e só você pode fazer ela sorrir de novo."
        </p>
        <p className="text-right text-dark/40 text-xs mt-auto">— 3 —</p>
      </>
    ),
  },
  {
    kind: "soft" as const,
    bg: "bg-gradient-to-b from-purple-50 to-purple-100",
    content: (
      <>
        <div className="text-center text-7xl mb-6" aria-hidden>
          🌳💜
        </div>
        <p className="font-serif text-lg text-dark/85 leading-relaxed">
          Sofia abraçou a árvore antiga e sussurrou no ouvido dela uma canção
          que aprendeu com a vovó. A árvore suspirou, e de cada galho brotou
          uma flor roxa, a cor favorita da Sofia.
        </p>
        <p className="text-right text-dark/40 text-xs mt-auto">— 4 —</p>
      </>
    ),
  },
  {
    kind: "soft" as const,
    bg: "bg-gradient-to-br from-primary/10 to-secondary/10",
    content: (
      <>
        <div className="text-center text-7xl mb-6" aria-hidden>
          ✨🏡
        </div>
        <p className="font-serif text-lg text-dark/85 leading-relaxed">
          A floresta toda cantou pra Sofia. E quando ela voltou pra casa, no
          bolso do casaco, havia uma florzinha roxa — pra lembrar que a coragem
          dela tinha poder de transformar qualquer tristeza em flor.
        </p>
        <p className="text-right text-dark/40 text-xs mt-auto">— 5 —</p>
      </>
    ),
  },
  {
    kind: "hard" as const,
    bg: "bg-gradient-to-br from-secondary to-primary-dark",
    content: (
      <>
        <p className="font-script text-3xl md:text-4xl text-white">Fim</p>
        <p className="font-serif text-white/80 mt-6 text-sm max-w-xs">
          Cada página é ilustrada do zero pela nossa equipe a partir das suas
          escolhas e da foto da criança.
        </p>
        <div className="mt-8 text-white/90 font-serif text-lg">
          Era Uma Vez Eu
        </div>
      </>
    ),
  },
];
