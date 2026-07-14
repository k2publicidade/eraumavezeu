import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-light px-4 py-16 text-center">
      <div className="max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-dark">Erro 404</p>
        <h1 className="mt-4 font-serif text-4xl text-primary md:text-5xl">Essa história ainda não foi escrita</h1>
        <p className="mt-5 text-base leading-7 text-dark/70">
          O endereço pode ter mudado ou a página não existe. Volte ao início para continuar sua jornada.
        </p>
        <Link href="/" className="btn-primary mt-8 inline-flex min-h-11 items-center px-8 py-3.5">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
