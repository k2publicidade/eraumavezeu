import { notFound } from "next/navigation";
import ContentPageForm from "@/components/admin/ContentPageForm";
import { db } from "@/lib/db";

export default async function EditContentPage({ params }: { params: { id: string } }) {
  const page = await db.contentPage.findUnique({ where: { id: params.id } });
  if (!page) notFound();
  return <div className="space-y-6"><header><p className="text-sm uppercase tracking-[0.22em] text-fox">CMS</p><h1 className="mt-1 font-serif text-4xl text-primary">Editar página</h1><p className="mt-2 text-dark/60">Alterações publicadas aparecem no site imediatamente após salvar.</p></header><ContentPageForm page={page} /></div>;
}
