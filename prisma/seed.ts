import { PrismaClient, ProductType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const produtos = [
    {
      slug: "livro-principal-capa-dura",
      name: "Livro Principal Capa Dura",
      description:
        "Livro infantil personalizado em capa dura, 20 páginas com ilustrações únicas geradas por IA. O herói da história é a criança que você ama.",
      price: 249.9,
      priceOld: 299.9,
      type: ProductType.LIVRO_PRINCIPAL,
      images: [],
    },
    {
      slug: "ebook",
      name: "E-book",
      description:
        "Versão digital do livro personalizado em PDF de alta qualidade, enviado por e-mail.",
      price: 89.9,
      type: ProductType.EBOOK,
      images: [],
    },
    {
      slug: "livro-colorir",
      name: "Livro de Colorir",
      description:
        "Versão para colorir com as ilustrações do livro principal em preto e branco. Horas de diversão criativa.",
      price: 99.9,
      type: ProductType.LIVRO_COLORIR,
      images: [],
    },
    {
      slug: "quebra-cabeca",
      name: "Quebra-Cabeça",
      description:
        "Quebra-cabeça personalizado com uma das ilustrações do livro. 48 peças em MDF premium.",
      price: 79.9,
      type: ProductType.QUEBRA_CABECA,
      images: [],
    },
    {
      slug: "cartela-adesivos",
      name: "Cartela de Adesivos",
      description:
        "Cartela com adesivos dos personagens do livro para personalizar cadernos, fichários e mochilas.",
      price: 69.9,
      type: ProductType.CARTELA_ADESIVOS,
      images: [],
    },
  ];

  for (const produto of produtos) {
    await prisma.product.upsert({
      where: { slug: produto.slug },
      create: produto,
      update: produto,
    });
    console.log(`✓ ${produto.slug}`);
  }

  console.log(`\nSeed concluído: ${produtos.length} produtos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
