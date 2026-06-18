"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/app/actions/admin-products";
import type { ProductType } from "@prisma/client";

type ProductFormProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    priceOld: number | null;
    type: ProductType;
    active: boolean;
  };
};

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [active, setActive] = useState(product.active);

  function submit(formData: FormData) {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateProduct({
        id: product.id,
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        price: String(formData.get("price") ?? ""),
        priceOld: String(formData.get("priceOld") ?? ""),
        active,
      });

      if (res.ok) {
        setFeedback({ kind: "ok", text: "Produto salvo com sucesso." });
        router.refresh();
      } else {
        setFeedback({ kind: "error", text: res.error });
      }
    });
  }

  return (
    <form action={submit} className="space-y-5 rounded-3xl border border-gold/25 bg-cream-light p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-primary">Nome</span>
          <input name="name" defaultValue={product.name} className="input-field mt-1" required />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-primary">Slug</span>
          <input value={product.slug} className="input-field mt-1 opacity-70" disabled />
          <span className="mt-1 block text-xs text-dark/50">Slug não é editável para preservar carrinhos e URLs.</span>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-primary">Descrição</span>
        <textarea name="description" defaultValue={product.description} rows={8} className="input-field mt-1" required />
      </label>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-primary">Preço atual</span>
          <input name="price" type="number" step="0.01" min="0" defaultValue={product.price} className="input-field mt-1" required />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-primary">Preço antigo</span>
          <input name="priceOld" type="number" step="0.01" min="0" defaultValue={product.priceOld ?? ""} className="input-field mt-1" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-primary">Tipo</span>
          <input value={product.type} className="input-field mt-1 opacity-70" disabled />
        </label>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-gold/25 bg-cream p-4 text-sm text-dark">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-5 w-5 accent-primary" />
        Produto ativo no site
      </label>

      {feedback && (
        <p
          role="alert"
          className={`rounded-2xl px-4 py-3 text-sm ${
            feedback.kind === "ok" ? "border border-forest/30 bg-forest/10 text-forest" : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Salvando…" : "Salvar produto"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.push("/admin/produtos")}>
          Voltar
        </button>
      </div>
    </form>
  );
}
