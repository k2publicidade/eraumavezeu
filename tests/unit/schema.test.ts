import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient, ProductType } from "@prisma/client";

// Teste de integração real contra o Supabase configurado em .env.local.
// Valida FND-08 (5 produtos com preços do brief) + FND-03 (schema aplicado com tipos corretos).
//
// Pré-requisitos:
//   - `prisma migrate dev --name init` já executado (Task 2)
//   - `pnpm db:seed` já executado (Task 2)
//   - DATABASE_URL válida exportada (via `dotenv -e .env.local` ou shell do CI)
//
// Rodar: `RUN_DB_TESTS=true npx dotenv -e .env.local -- pnpm test tests/unit/schema.test.ts`
const shouldRunDbTests = process.env.RUN_DB_TESTS === "true";
const prisma = shouldRunDbTests ? new PrismaClient() : null;

describe.skipIf(!shouldRunDbTests)("seed products (FND-08)", () => {
  beforeAll(() => {
    // sanity: se DATABASE_URL não estiver setado, falha explícito em vez de
    // travar numa conexão default do Prisma que confunde o relatório.
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL ausente. Rode os tests com: npx dotenv -e .env.local -- pnpm test"
      );
    }
  });

  afterAll(async () => {
    await prisma?.$disconnect();
  });

  it("gravou exatamente 5 produtos", async () => {
    const count = await prisma!.product.count();
    expect(count).toBe(5);
  });

  it("livro principal: slug, nome, preço, tipo, active", async () => {
    const p = await prisma!.product.findUnique({
      where: { slug: "livro-principal-capa-dura" },
    });
    expect(p).not.toBeNull();
    expect(p!.name).toMatch(/Livro Capa Dura/);
    expect(Number(p!.price)).toBeCloseTo(249.9, 2);
    expect(p!.type).toBe(ProductType.LIVRO_PRINCIPAL);
    expect(p!.active).toBe(true);
  });

  it.each([
    ["ebook", 79.9, ProductType.EBOOK],
    ["livro-colorir", 99.9, ProductType.LIVRO_COLORIR],
    ["quebra-cabeca", 79.9, ProductType.QUEBRA_CABECA],
    ["cartela-adesivos", 69.9, ProductType.CARTELA_ADESIVOS],
  ] as const)(
    "adicional %s com preço %s e type %s",
    async (slug, preco, tipo) => {
      const p = await prisma!.product.findUnique({ where: { slug } });
      expect(p).not.toBeNull();
      expect(Number(p!.price)).toBeCloseTo(preco, 2);
      expect(p!.type).toBe(tipo);
      expect(p!.active).toBe(true);
    }
  );

  it("soma dos 4 adicionais = 329.60 (base pro combo da Fase 3)", async () => {
    const adicionais = await prisma!.product.findMany({
      where: {
        slug: {
          in: ["ebook", "livro-colorir", "quebra-cabeca", "cartela-adesivos"],
        },
      },
    });
    const soma = adicionais.reduce((acc, p) => acc + Number(p.price), 0);
    expect(soma).toBeCloseTo(329.6, 2);
  });

  it("todos os 5 produtos estão ativos", async () => {
    const inativos = await prisma!.product.count({ where: { active: false } });
    expect(inativos).toBe(0);
  });

  it("soma total dos 5 produtos = 579.50", async () => {
    const todos = await prisma!.product.findMany();
    const soma = todos.reduce((acc, p) => acc + Number(p.price), 0);
    expect(soma).toBeCloseTo(579.5, 2);
  });
});
