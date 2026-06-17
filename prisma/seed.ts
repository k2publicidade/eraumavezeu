import { PrismaClient, ProductType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const produtos = [
    {
      slug: "livro-principal-capa-dura",
      name: "Livro Capa Dura",
      description:
        "Livro infantil personalizado em capa dura, 20 páginas com ilustrações únicas geradas por IA. O herói da história é a criança que você ama. Cada livro tem um design e roteiro único, nenhum exemplar é igual ao outro. Inclui também a sua dedicatória personalizada. Tamanho 21x30 cm.",
      price: 249.9,
      priceOld: 299.9,
      type: ProductType.LIVRO_PRINCIPAL,
      images: [],
    },
    {
      slug: "ebook",
      name: "E-book",
      description:
        "Versão digital do livro personalizado em PDF de alta qualidade, enviado por e-mail. Na compra do livro capa dura, o e-book está incluso de presente!",
      price: 79.9,
      type: ProductType.EBOOK,
      images: [],
    },
    {
      slug: "livro-colorir",
      name: "Livro de Colorir",
      description:
        "Imagine a alegria da criança ao poder colorir a própria imagem. São 20 páginas repletas de cenas da aventura escolhida, onde ela é a verdadeira protagonista. Você define o estilo da arte e nós entregamos um livro no tamanho perfeito (22x15cm) para levar a criatividade a qualquer lugar!",
      price: 99.9,
      type: ProductType.LIVRO_COLORIR,
      images: [],
    },
    {
      slug: "quebra-cabeca",
      name: "Quebra-Cabeça",
      description:
        "Monte essa magia junto com a criança! Transforme uma imagem personalizada do seu filho — ou uma foto especial escolhida por você — em um quebra-cabeça de 60 peças (21x29 cm). A alegria de ver o próprio rosto se formando a cada encaixe!",
      price: 79.9,
      type: ProductType.QUEBRA_CABECA,
      images: [],
    },
    {
      slug: "cartela-adesivos",
      name: "Cartela de Adesivos",
      description:
        "Uma super cartela (28x40 cm) repleta de ilustrações personalizadas do protagonista e elementos do tema. Perfeita para a criança soltar a imaginação e personalizar o que quiser!",
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
