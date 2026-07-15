"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteContentPage, saveContentPage } from "@/app/actions/admin-pages";
import { UploadButton } from "@/lib/uploadthing-client";

type Page = { id: string; slug: string; title: string; eyebrow: string | null; summary: string | null; body: string; heroImage: string | null; ctaLabel: string | null; ctaHref: string | null; seoTitle: string | null; seoDescription: string | null; published: boolean };

export default function ContentPageForm({ page }: { page?: Page }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [published, setPublished] = useState(page?.published ?? false);
  const [heroImage, setHeroImage] = useState(page?.heroImage ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const field = "input-field mt-1";

  function submit(formData: FormData) {
    setFeedback(null);
    startTransition(async () => {
      const result = await saveContentPage({ id: page?.id, published, heroImage, ...Object.fromEntries(formData) });
      if (!result.ok) return setFeedback(result.error);
      router.push(`/admin/paginas/${result.id}`);
      router.refresh();
    });
  }

  return <form action={submit} className="space-y-6 rounded-3xl border border-gold/25 bg-white p-6 shadow-sm">
    <div className="grid gap-5 md:grid-cols-2">
      <label><span className="text-sm font-medium text-primary">Título</span><input name="title" defaultValue={page?.title ?? ""} className={field} required /></label>
      <label><span className="text-sm font-medium text-primary">URL</span><input name="slug" defaultValue={page?.slug ?? ""} className={field} placeholder="ex.: como-funciona" required /><small className="text-dark/50">Sem domínio; o CMS normaliza acentos e espaços.</small></label>
      <label><span className="text-sm font-medium text-primary">Chamada superior</span><input name="eyebrow" defaultValue={page?.eyebrow ?? ""} className={field} /></label>
      <label><span className="text-sm font-medium text-primary">Título para buscadores</span><input name="seoTitle" defaultValue={page?.seoTitle ?? ""} maxLength={70} className={field} /></label>
    </div>
    <label className="block"><span className="text-sm font-medium text-primary">Resumo</span><textarea name="summary" defaultValue={page?.summary ?? ""} rows={3} className={field} /></label>
    <label className="block"><span className="text-sm font-medium text-primary">Conteúdo</span><textarea name="body" defaultValue={page?.body ?? ""} rows={16} className={`${field} font-mono`} required /><small className="text-dark/50">Use linhas começando com # ou ## para títulos e “- ” para listas.</small></label>
    <label className="block"><span className="text-sm font-medium text-primary">Descrição para buscadores</span><textarea name="seoDescription" defaultValue={page?.seoDescription ?? ""} maxLength={170} rows={2} className={field} /></label>
    <section className="rounded-2xl border border-gold/25 bg-cream p-4">
      <p className="text-sm font-medium text-primary">Imagem de capa</p>
      {heroImage && <div className="mt-3 flex items-center gap-4"><img src={heroImage} alt="Prévia" className="h-24 w-36 rounded-xl object-cover" /><button type="button" onClick={() => setHeroImage("")} className="text-sm text-red-700">Remover</button></div>}
      {!heroImage && <div className="mt-3"><UploadButton endpoint="productImage" onClientUploadComplete={(files) => setHeroImage(files[0]?.serverData?.url ?? files[0]?.ufsUrl ?? files[0]?.url ?? "")} onUploadError={(error) => setFeedback(error.message)} /></div>}
    </section>
    <div className="grid gap-5 md:grid-cols-2"><label><span className="text-sm font-medium text-primary">Texto do botão</span><input name="ctaLabel" defaultValue={page?.ctaLabel ?? ""} className={field} /></label><label><span className="text-sm font-medium text-primary">Destino do botão</span><input name="ctaHref" defaultValue={page?.ctaHref ?? ""} className={field} placeholder="/personalizar" /></label></div>
    <label className="flex items-center gap-3 rounded-2xl bg-cream p-4"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-5 w-5 accent-primary" /><span><strong className="block text-primary">Publicada</strong><small className="text-dark/55">Desmarque para manter como rascunho ou retirar do site.</small></span></label>
    {feedback && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{feedback}</p>}
    <div className="flex flex-wrap gap-3 border-t border-gold/20 pt-5"><button disabled={pending} className="btn-primary">{pending ? "Salvando…" : "Salvar página"}</button>{page?.published && <a href={`/${page.slug}`} target="_blank" className="btn-ghost">Visualizar</a>}{page && <button type="button" className="ml-auto text-sm text-red-700" onClick={() => confirm("Excluir esta página permanentemente?") && startTransition(async () => { const result = await deleteContentPage(page.id); if (result.ok) router.push("/admin/paginas"); else setFeedback(result.error); })}>Excluir página</button>}</div>
  </form>;
}
