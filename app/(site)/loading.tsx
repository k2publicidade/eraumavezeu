export default function SiteLoading() {
  return (
    <div role="status" aria-live="polite" className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
      <span className="sr-only">Carregando conteúdo…</span>
      <div className="animate-pulse" aria-hidden="true">
        <div className="h-3 w-32 rounded-full bg-gold/25" />
        <div className="mt-6 h-12 w-full max-w-xl rounded-2xl bg-primary/10" />
        <div className="mt-4 h-5 w-full max-w-2xl rounded-full bg-primary/10" />
        <div className="mt-2 h-5 w-4/5 max-w-xl rounded-full bg-primary/10" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-52 rounded-3xl border border-primary/10 bg-primary/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
