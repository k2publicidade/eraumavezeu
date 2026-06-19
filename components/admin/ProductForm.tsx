"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, deleteProduct, updateProduct } from "@/app/actions/admin-products";
import { PRODUCT_TYPE_OPTIONS, buildProductSlug } from "@/lib/admin/products";
import { UploadButton } from "@/lib/uploadthing-client";
import type { ProductType } from "@prisma/client";

type EditableProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  priceOld: number | null;
  type: ProductType;
  active: boolean;
  images: string[];
};

type ProductFormProps = {
  product?: EditableProduct;
};

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [active, setActive] = useState(product?.active ?? true);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isEditing = Boolean(product);
  const slugPreview = useMemo(() => buildProductSlug(slug || name), [name, slug]);
  const canUploadMore = images.length < 6;

  function submit(formData: FormData) {
    setFeedback(null);
    const payload = {
      id: product?.id,
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: String(formData.get("price") ?? ""),
      priceOld: String(formData.get("priceOld") ?? ""),
      type: String(formData.get("type") ?? ""),
      active,
      productImageUrls: formData.getAll("productImageUrls"),
    };

    startTransition(async () => {
      const res = isEditing ? await updateProduct(payload) : await createProduct(payload);

      if (res.ok) {
        setFeedback({ kind: "ok", text: res.message ?? "Produto salvo com sucesso." });
        if (!isEditing && res.id) {
          router.push(`/admin/produtos/${res.id}`);
          return;
        }
        router.refresh();
      } else {
        setFeedback({ kind: "error", text: res.error });
      }
    });
  }

  function remove() {
    if (!product) return;
    const confirmed = window.confirm(
      "Excluir este produto? Se ele já estiver vinculado a pedidos, será desativado para preservar o histórico.",
    );
    if (!confirmed) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await deleteProduct(product.id);
      if (res.ok) {
        router.push("/admin/produtos");
        router.refresh();
      } else {
        setFeedback({ kind: "error", text: res.error });
      }
    });
  }

  return (
    <form action={submit} className="space-y-5 rounded-3xl border border-gold/25 bg-cream-light p-6 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-primary">Nome</span>
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="input-field mt-1"
            placeholder="Ex.: Livro Capa Dura Premium"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-primary">Slug</span>
          <input
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="input-field mt-1"
            placeholder={slugPreview || "gerado-automaticamente"}
          />
          <span className="mt-1 block text-xs text-dark/50">
            URL limpa: /{slugPreview || "produto"}. Se deixar em branco, geramos pelo nome.
          </span>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-primary">Descrição</span>
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          rows={8}
          className="input-field mt-1"
          placeholder="Descreva o produto, medidas, diferenciais e o que acompanha."
          required
        />
      </label>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-primary">Preço atual</span>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={product?.price ?? ""}
            className="input-field mt-1"
            placeholder="249.90"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-primary">Preço antigo</span>
          <input
            name="priceOld"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={product?.priceOld ?? ""}
            className="input-field mt-1"
            placeholder="Opcional"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-primary">Tipo</span>
          <select name="type" defaultValue={product?.type ?? "LIVRO_PRINCIPAL"} className="input-field mt-1" required>
            {PRODUCT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="rounded-2xl border border-gold/25 bg-cream p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-primary">Imagem do produto</h2>
            <p className="mt-1 text-xs text-dark/55">Faça upload das imagens que aparecerão no catálogo. Máximo de 6 imagens.</p>
          </div>
          {canUploadMore && (
            <UploadButton
              endpoint="productImage"
              appearance={{
                button: "bg-primary hover:bg-primary-light ut-ready:bg-primary ut-uploading:bg-primary-dark",
                allowedContent: "text-dark/50",
              }}
              onClientUploadComplete={(res) => {
                setUploadError(null);
                const uploaded = res
                  .map((file) => file.serverData?.url ?? file.ufsUrl ?? file.url)
                  .filter((url): url is string => Boolean(url));
                setImages((current) => [...current, ...uploaded].slice(0, 6));
              }}
              onUploadError={(error) => setUploadError(error.message || "Falha no upload da imagem.")}
            />
          )}
        </div>

        {images.length > 0 ? (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((imageUrl, index) => (
              <li key={`${imageUrl}-${index}`} className="relative overflow-hidden rounded-2xl border border-gold/25 bg-white">
                <input type="hidden" name="productImageUrls" value={imageUrl} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={`Imagem ${index + 1} do produto`} className="aspect-[4/3] w-full object-cover" />
                <button
                  type="button"
                  aria-label="Remover imagem do produto"
                  onClick={() => setImages((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-sm font-bold text-dark shadow transition hover:bg-red-500 hover:text-white"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-gold/40 bg-cream-light p-6 text-sm text-dark/55">
            Nenhuma imagem enviada ainda. Use o botão de upload para cadastrar a imagem do produto.
          </div>
        )}

        {uploadError && <p className="mt-3 text-sm font-medium text-red-700">{uploadError}</p>}
      </section>

      <label className="flex items-center gap-3 rounded-2xl border border-gold/25 bg-cream p-4 text-sm text-dark">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="h-5 w-5 accent-primary" />
        Produto ativo no site e disponível para próximos pedidos
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

      <div className="flex flex-wrap gap-3 border-t border-gold/20 pt-5">
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Salvando…" : isEditing ? "Salvar alterações" : "Cadastrar produto"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.push("/admin/produtos")}>
          Voltar
        </button>
        {isEditing && (
          <button
            type="button"
            className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            onClick={remove}
            disabled={isPending}
          >
            Excluir produto
          </button>
        )}
      </div>
    </form>
  );
}
