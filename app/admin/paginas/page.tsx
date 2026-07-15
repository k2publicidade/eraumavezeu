import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await db.contentPage.findMany({ orderBy: { updatedAt: "desc" } });
  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm uppercase tracking-[0.22em] text-fox">CMS</p><h1 className="mt-1 font-serif text-4xl text-primary">Páginas do site</h1><p className="mt-2 max-w-2xl text-dark/60">Crie páginas institucionais, campanhas e conteúdos com publicação, SEO, imagem e chamada para ação.</p></div><Link href="/admin/paginas/nova" className="btn-primary">Nova página</Link></header>
    <div className="overflow-x-auto rounded-3xl border border-gold/25 bg-white">
      <table className="w-full text-sm"><thead><tr className="border-b border-gold/20 text-left text-primary"><th className="p-4">Página</th><th className="p-4">URL</th><th className="p-4">Status</th><th className="p-4">Atualizada</th><th className="p-4">Ações</th></tr></thead><tbody>{pages.map((page) => <tr key={page.id} className="border-b border-gold/10 last:border-0"><td className="p-4 font-medium text-primary">{page.title}</td><td className="p-4 text-dark/60">/{page.slug}</td><td className="p-4"><span className={`rounded-full px-3 py-1 text-xs ${page.published ? "bg-forest/10 text-forest" : "bg-amber-50 text-amber-800"}`}>{page.published ? "Publicada" : "Rascunho"}</span></td><td className="p-4 text-dark/55">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(page.updatedAt)}</td><td className="p-4"><Link href={`/admin/paginas/${page.id}`} className="text-primary hover:underline">Editar</Link>{page.published && <a href={`/${page.slug}`} target="_blank" className="ml-4 text-dark/55 hover:underline">Ver</a>}</td></tr>)}</tbody></table>
      {!pages.length && <div className="p-10 text-center text-dark/55"><p>Nenhuma página criada.</p><Link href="/admin/paginas/nova" className="btn-primary mt-4 inline-flex">Criar primeira página</Link></div>}
    </div>
  </div>;
}
