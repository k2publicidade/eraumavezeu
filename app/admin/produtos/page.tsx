import Link from "next/link";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  LIVRO_PRINCIPAL: "Livro principal",
  EBOOK: "E-book",
  LIVRO_COLORIR: "Livro de colorir",
  QUEBRA_CABECA: "Quebra-cabeça",
  CARTELA_ADESIVOS: "Cartela de adesivos",
};

export default async function AdminProductsPage() {
  const products = await db.product.findMany({ orderBy: [{ active: "desc" }, { price: "desc" }] });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-fox">Catálogo</p>
          <h1 className="mt-2 font-serif text-4xl text-primary">Produtos</h1>
          <p className="mt-2 text-dark/60">Edite preços, descrições e disponibilidade dos produtos vendidos no site.</p>
        </div>
        <Link href="/produtos" className="btn-ghost">Ver loja →</Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl border border-gold/25 bg-cream-light">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/25 text-left text-primary">
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Preço</th>
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
                <td className="px-4 py-3 text-dark/70">{TYPE_LABELS[product.type] ?? product.type}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-primary">{formatBRL(Number(product.price))}</span>
                  {product.priceOld && <span className="ml-2 text-xs text-dark/45 line-through">{formatBRL(Number(product.priceOld))}</span>}
                </td>
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
        {products.length === 0 && <p className="py-8 text-center text-dark/55">Nenhum produto cadastrado.</p>}
      </div>
    </div>
  );
}
