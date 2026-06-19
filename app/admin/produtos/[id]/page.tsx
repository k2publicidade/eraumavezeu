import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({ params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id } }).catch(() => null);
  if (!product) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/admin/produtos" className="text-sm text-dark/60 hover:text-primary">
        ← Voltar para produtos
      </Link>
      <div className="mt-3 mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-fox">Catálogo</p>
        <h1 className="mt-2 font-serif text-4xl text-primary">Editar produto</h1>
        <p className="mt-2 text-dark/60">Alterações afetam a vitrine, carrinho e próximos pedidos.</p>
      </div>
      <ProductForm
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          priceOld: product.priceOld ? Number(product.priceOld) : null,
          type: product.type,
          active: product.active,
          images: product.images,
        }}
      />
    </div>
  );
}
