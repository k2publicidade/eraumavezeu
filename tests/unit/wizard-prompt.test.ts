import { describe, expect, it } from "vitest";
import { gerarPromptIA, type PromptInput } from "@/lib/wizard/prompt";

const BASE: PromptInput = {
  theme: "dinossauros",
  genre: "aventura",
  artStyle: "lapiz",
  favoriteColor: "laranja",
  ageRange: "4-6",
  childName: "Sofia",
  dedication: null,
  photoCount: 2,
};

describe("gerarPromptIA", () => {
  it("produces markdown with required sections in PT-BR", () => {
    const out = gerarPromptIA(BASE);
    expect(out).toContain("# Livro personalizado — Sofia");
    expect(out).toContain("## Parâmetros");
    expect(out).toContain("## Briefing para a equipe");
  });

  it("resolves slugs into human labels", () => {
    const out = gerarPromptIA(BASE);
    expect(out).toContain("Dinossauros");
    expect(out).toContain("Aventura");
    expect(out).toContain("Lápis de cor");
    expect(out).toContain("Laranja");
    expect(out).toContain("4 a 6 anos");
  });

  it("mentions the exact number of reference photos", () => {
    const out = gerarPromptIA({ ...BASE, photoCount: 4 });
    expect(out).toContain("4 (usar somente como referência");
  });

  it("omits dedication block when empty", () => {
    const out = gerarPromptIA({ ...BASE, dedication: null });
    expect(out).not.toContain("Dedicatória");
  });

  it("includes dedication block when provided", () => {
    const out = gerarPromptIA({
      ...BASE,
      dedication: "Para a Sofia, com amor",
    });
    expect(out).toContain("## Dedicatória");
    expect(out).toContain("Para a Sofia, com amor");
    expect(out).toContain("Dancing Script");
  });

  it("throws when childName is blank", () => {
    expect(() => gerarPromptIA({ ...BASE, childName: "  " })).toThrow(
      /childName/,
    );
  });

  it("throws on unknown slug", () => {
    expect(() =>
      // @ts-expect-error exercising runtime validation
      gerarPromptIA({ ...BASE, theme: "alienigenas" }),
    ).toThrow(/Unknown slug/);
  });

  it("is deterministic for same input", () => {
    expect(gerarPromptIA(BASE)).toBe(gerarPromptIA(BASE));
  });
});
