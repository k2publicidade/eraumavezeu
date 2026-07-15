import ContentPageForm from "@/components/admin/ContentPageForm";

export default function NewContentPage() {
  return <div className="space-y-6"><header><p className="text-sm uppercase tracking-[0.22em] text-fox">CMS</p><h1 className="mt-1 font-serif text-4xl text-primary">Nova página</h1><p className="mt-2 text-dark/60">Prepare o conteúdo e publique quando estiver pronto.</p></header><ContentPageForm /></div>;
}
