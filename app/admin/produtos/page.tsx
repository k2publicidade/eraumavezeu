import Link from "next/link";
import { db } from "@/lib/db";
import { PRODUCT_TYPE_LABELS } from "@/lib/admin/products";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: [{ active: "desc" }, { updatedAt: "desc" }],
    include: { _count: { select: { orderItems: true } } },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-fox">Catálogo</p>
          <h1 className="mt-2 font-serif text-4xl text-primary">Produtos</h1>
          <p className="mt-2 max-w-2xl text-dark/60">
            Cadastre, edite, desative ou exclua produtos. Produtos ativos aparecem na loja, no carrinho e serão usados como fonte de preço no checkout.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/produtos" className="btn-ghost">Ver loja →</Link>
          <Link href="/admin/produtos/novo" className="btn-primary">Novo produto</Link>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl border border-gold/25 bg-cream-light shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/25 text-left text-primary">
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Pedidos</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gold/15 last:border-0 hover:bg-cream">
                <td className="px-4 py-3">
                  <p className="font-medium text-dark">{product.name}</p>
                  <p className="text-xs text-dark/50">/{product.slug}</p>
                </td>
                <td className="px-4 py-3 text-dark/70">{PRODUCT_TYPE_LABELS[product.type] ?? product.type}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-primary">{formatBRL(Number(product.price))}</span>
                  {product.priceOld && <span className="ml-2 text-xs text-dark/45 line-through">{formatBRL(Number(product.priceOld))}</span>}
                </td>
                <td className="px-4 py-3 text-dark/65">{product._count.orderItems}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2.5 py-1 text-xs ${product.active ? "border-forest/30 bg-forest/10 text-forest" : "border-red-200 bg-red-50 text-red-700"}`}>
                    {product.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/produtos/${product.id}`} className="text-primary underline-offset-2 hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-dark/55">Nenhum produto cadastrado.</p>
            <Link href="/admin/produtos/novo" className="btn-primary mt-4 inline-flex">Cadastrar primeiro produto</Link>
          </div>
        )}
      </div>
    </div>
  );
}
