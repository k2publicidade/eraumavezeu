import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { cn, formatBRL, slugify } from "@/lib/utils";
import tailwindConfig from "@/tailwind.config";

describe("scaffold smoke", () => {
  it("cn combina classes via clsx + tailwind-merge", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("p-2", "p-4")).toBe("p-4"); // tailwind-merge resolve conflito
  });

  it("formatBRL produz string com R$ e vírgula decimal", () => {
    const out = formatBRL(249.9);
    expect(out).toContain("R$");
    expect(out).toContain("249,90");
  });

  it("slugify normaliza PT-BR com acentos", () => {
    expect(slugify("Era Uma Vez Eu!")).toBe("era-uma-vez-eu");
    expect(slugify("São João")).toBe("sao-joao");
  });

  it("tailwind.config preserva paleta da marca", () => {
    const colors = (tailwindConfig.theme as any).extend.colors;
    expect(colors.primary.DEFAULT).toBe("#1B2A4A");
    expect(colors.secondary).toBe("#8BA888");
    expect(colors.gold.DEFAULT).toBe("#D4A843");
  });

  it("package.json pinnou Next 14 + React 18 + Tailwind 3 (evita quebra de react-pageflip)", () => {
    const pkg = JSON.parse(
      readFileSync(path.resolve(__dirname, "../../package.json"), "utf-8")
    );
    expect(pkg.dependencies.next).toBe("14.2.21");
    expect(pkg.dependencies.react).toBe("18.3.1");
    expect(pkg.dependencies["react-dom"]).toBe("18.3.1");
    expect(pkg.devDependencies.tailwindcss).toMatch(/^\^3\./);
  });
});
