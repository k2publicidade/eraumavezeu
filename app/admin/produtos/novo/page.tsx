import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default function AdminProductCreatePage() {
  return (
    <div className="max-w-4xl">
      <Link href="/admin/produtos" className="text-sm text-dark/60 hover:text-primary">
        ← Voltar para produtos
      </Link>
      <div className="mt-3 mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-fox">Catálogo</p>
        <h1 className="mt-2 font-serif text-4xl text-primary">Novo produto</h1>
        <p className="mt-2 text-dark/60">Cadastre um produto para aparecer na loja e ficar disponível para o checkout.</p>
      </div>
      <ProductForm />
    </div>
  );
}
