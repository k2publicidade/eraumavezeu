import { describe, expect, it } from "vitest";
import { FALLBACK_PRODUCTS, resolveCatalogProducts } from "@/lib/products";
import { buildProductSlug, parseImageLines, productActionSchema } from "@/lib/admin/products";

describe("admin product helpers", () => {
  it("builds stable URL slugs from product names", () => {
    expect(buildProductSlug(" Livro Mágico da Júlia! ")).toBe("livro-magico-da-julia");
    expect(buildProductSlug("Quebra-Cabeça 60 peças")).toBe("quebra-cabeca-60-pecas");
  });

  it("normalizes image URLs from multiline input", () => {
    expect(parseImageLines(" https://cdn.test/a.png\n\nhttps://cdn.test/b.png ")).toEqual([
      "https://cdn.test/a.png",
      "https://cdn.test/b.png",
    ]);
  });

  it("validates complete create/edit product payloads", () => {
    const parsed = productActionSchema.parse({
      name: "Livro Premium Personalizado",
      slug: "livro-premium",
      description: "Livro capa dura personalizado com ilustrações únicas para a criança.",
      price: "249.90",
      priceOld: "299.90",
      type: "LIVRO_PRINCIPAL",
      active: "on",
      imagesText: "https://cdn.test/book.png",
    });

    expect(parsed.price).toBe(249.9);
    expect(parsed.priceOld).toBe(299.9);
    expect(parsed.active).toBe(true);
    expect(parsed.images).toEqual(["https://cdn.test/book.png"]);
  });
});

describe("catalog product resolution", () => {
  it("uses safe fallback products when database returns no active products", () => {
    expect(resolveCatalogProducts([])).toEqual(FALLBACK_PRODUCTS);
  });
});
