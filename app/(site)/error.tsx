"use client";

export default function SiteError({ reset }: { reset: () => void }) {
  return (
    <section className="container mx-auto flex max-w-3xl flex-1 items-center px-4 py-20 md:py-28">
      <div role="alert" className="w-full rounded-[2rem] border border-primary/15 bg-cream-light p-8 text-center shadow-sm md:p-12">
        <span aria-hidden="true" className="text-4xl">🪶</span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">Um pequeno imprevisto</p>
        <h1 className="mt-3 font-serif text-3xl text-primary md:text-4xl">Esta página não abriu como deveria</h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-dark/70">
          Seus dados continuam seguros. Tente carregar novamente; se o problema persistir, fale com nossa equipe.
        </p>
        <button type="button" onClick={reset} className="btn-primary mt-8 min-h-11 px-8 py-3.5">
          Tentar novamente
        </button>
      </div>
    </section>
  );
}
