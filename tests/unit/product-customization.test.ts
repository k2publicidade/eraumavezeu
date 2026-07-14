import { describe, expect, it } from "vitest";
import {
  PRODUCT_FORM_VERSION,
  buildProductionBrief,
  productCustomizationSchema,
  type ProductCustomizationInput,
} from "@/lib/product-customization";

const BASE: ProductCustomizationInput = {
  productType: "CARTELA_ADESIVOS",
  childName: "Alice Martins",
  childAge: 6,
  childGender: "MENINA",
  favoriteColor: "Roxo",
  theme: "Dinossauros e natureza",
  storyGenre: "",
  artStyle: "",
  lineStyle: "",
  dedication: "",
  notes: "Tem um cachorro chamado Pingo.",
  photoKeys: ["photo-1", "photo-2", "photo-3", "photo-4"],
  consentAcceptedAt: "2026-07-14T12:00:00.000Z",
  consentTextVersion: PRODUCT_FORM_VERSION,
  confidentialityAcceptedAt: "2026-07-14T12:01:00.000Z",
};

describe("productCustomizationSchema", () => {
  it("aceita a ficha enxuta da cartela de adesivos", () => {
    expect(productCustomizationSchema.safeParse(BASE).success).toBe(true);
  });

  it("exige estilo visual para quebra-cabeça", () => {
    const result = productCustomizationSchema.safeParse({
      ...BASE,
      productType: "QUEBRA_CABECA",
    });
    expect(result.success).toBe(false);
  });

  it("exige gênero, estilo e dedicatória no livro principal", () => {
    const result = productCustomizationSchema.safeParse({
      ...BASE,
      productType: "LIVRO_PRINCIPAL",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        storyGenre: expect.any(Array),
        artStyle: expect.any(Array),
        dedication: expect.any(Array),
      });
    }
  });

  it("exige tipo de traço no livro de colorir", () => {
    const result = productCustomizationSchema.safeParse({
      ...BASE,
      productType: "LIVRO_COLORIR",
      storyGenre: "Aventura",
      artStyle: "DESENHO",
    });
    expect(result.success).toBe(false);
  });

  it("exige exatamente quatro fotos e os dois aceites", () => {
    const result = productCustomizationSchema.safeParse({
      ...BASE,
      photoKeys: ["photo-1"],
      confidentialityAcceptedAt: "",
    });
    expect(result.success).toBe(false);
  });

  it("gera brief organizado para a equipe de produção", () => {
    const parsed = productCustomizationSchema.parse({
      ...BASE,
      productType: "QUEBRA_CABECA",
      artStyle: "REALISTA",
    });
    const brief = buildProductionBrief(parsed);
    expect(brief).toContain("Quebra-cabeça personalizado");
    expect(brief).toContain("Alice Martins, 6 anos");
    expect(brief).toContain("Fotos de referência: 4");
  });
});
