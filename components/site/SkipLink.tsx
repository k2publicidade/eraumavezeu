export default function SkipLink({ targetId = "conteudo-principal" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="fixed left-4 top-3 z-50 -translate-y-20 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-cream shadow-md transition-transform duration-200 focus:translate-y-0"
    >
      Pular para o conteúdo principal
    </a>
  );
}
