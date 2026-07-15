export const GALLERY_THEMES = [
  { slug: "todos", label: "Todos" },
  { slug: "dinossauros", label: "Dinossauros" },
  { slug: "floresta_encantada", label: "Floresta Encantada" },
  { slug: "trem", label: "Aventura no Trem" },
  { slug: "princesas", label: "Princesas" },
  { slug: "robos", label: "Robôs" },
] as const;

export type GallerySample = {
  id: string;
  theme: string;
  title: string;
  age: string;
  emoji: string;
  coverImage: string;
  images: readonly string[];
  additionalProducts: readonly GalleryAdditionalProduct[];
  tagline: string;
  description: string;
  bookTitle: string;
  quote: string;
};

export type GalleryAdditionalProduct = {
  type: "EBOOK" | "LIVRO_COLORIR" | "QUEBRA_CABECA" | "CARTELA_ADESIVOS";
  label: string;
  shortLabel: string;
  description: string;
  images: readonly string[];
};

const ADDITIONAL_PRODUCT_COPY = {
  EBOOK: {
    label: "E-book personalizado",
    shortLabel: "E-book",
    description: "A mesma história personalizada em uma versão digital de alta definição.",
  },
  LIVRO_COLORIR: {
    label: "Livro de colorir personalizado",
    shortLabel: "Colorir",
    description: "Cenas da aventura transformadas em páginas para a criança pintar e recriar.",
  },
  QUEBRA_CABECA: {
    label: "Quebra-cabeça personalizado",
    shortLabel: "Quebra-cabeça",
    description: "Uma ilustração da história transformada em um desafio de 60 peças.",
  },
  CARTELA_ADESIVOS: {
    label: "Cartela de adesivos personalizada",
    shortLabel: "Adesivos",
    description: "Personagens e elementos do tema reunidos em uma cartela personalizada.",
  },
} as const;

function buildAdditionalProducts(
  character: "Bernardo" | "Sofia" | "Lara" | "Noah" | "Ravi",
): readonly GalleryAdditionalProduct[] {
  const folder = `/gallery/${character}/Adicionais`;
  const products: GalleryAdditionalProduct[] = [
    {
      type: "LIVRO_COLORIR",
      ...ADDITIONAL_PRODUCT_COPY.LIVRO_COLORIR,
      images: [
        `${folder}/${character} Colorir1.png`,
        `${folder}/${character} Colorir2.png`,
      ],
    },
    {
      type: "QUEBRA_CABECA",
      ...ADDITIONAL_PRODUCT_COPY.QUEBRA_CABECA,
      images: [`${folder}/${character} Quebra Cabeça.png`],
    },
    {
      type: "CARTELA_ADESIVOS",
      ...ADDITIONAL_PRODUCT_COPY.CARTELA_ADESIVOS,
      images: [`${folder}/${character} Adesivo.png`],
    },
  ];

  if (character === "Bernardo") {
    products.push({
      type: "EBOOK",
      ...ADDITIONAL_PRODUCT_COPY.EBOOK,
      images: [`${folder}/ebook.png`],
    });
  }

  return products;
}

export const GALLERY_SAMPLES: readonly GallerySample[] = [
  {
    id: "s1",
    theme: "dinossauros",
    title: "Bernardo e os Dinossauros",
    age: "4 anos",
    emoji: "🦖",
    coverImage: "/gallery/Bernardo/Bernardo2.png",
    images: [
      "/gallery/Bernardo/Bernardo2.png",
      "/gallery/Bernardo/Bernardo3.png",
      "/gallery/Bernardo/Bernardo1.png",
      "/gallery/Bernardo/Bernardo4.png",
      "/gallery/Bernardo/Bernardo5.png",
      "/gallery/Bernardo/Bernardo6.png"
    ],
    additionalProducts: buildAdditionalProducts("Bernardo"),
    tagline: "Uma viagem emocionante de volta ao tempo dos gigantes!",
    description: "O pequeno Bernardo explora o mundo pré-histórico, fazendo amizade com criaturas gigantes e descobrindo a magia de um passado fascinante. Cada página reflete o espírito aventureiro e o sorriso radiante de Bernardo.",
    bookTitle: "Aventura com Dinossauros",
    quote: "Com passos corajosos e um coração cheio de curiosidade, Bernardo descobriu que até os maiores gigantes podem ser grandes amigos."
  },
  {
    id: "s2",
    theme: "princesas",
    title: "Sofia e o Reino da Luz",
    age: "5 anos",
    emoji: "👑",
    coverImage: "/gallery/Sofia/Sofia2.png",
    images: [
      "/gallery/Sofia/Sofia2.png",
      "/gallery/Sofia/Sofia3.png",
      "/gallery/Sofia/Sofia1.png",
      "/gallery/Sofia/Sofia4.png",
      "/gallery/Sofia/Sofia5.png",
      "/gallery/Sofia/Sofia6.png"
    ],
    additionalProducts: buildAdditionalProducts("Sofia"),
    tagline: "Uma princesa corajosa guiando seu reino com amor e luz!",
    description: "Sofia descobre um reino mágico em apuros após as flores perderem seu brilho. Com sabedoria, bondade e um cetro mágico, ela lidera fadas e criaturas da floresta para trazer a luz de volta ao Reino da Luz.",
    bookTitle: "A Princesa e o Reino da Luz",
    quote: "Sofia sorriu, sabendo que a verdadeira realeza está no amor com que cuidamos do nosso mundo e de quem amamos."
  },
  {
    id: "s3",
    theme: "robos",
    title: "A Grande Missão de Lara",
    age: "6 anos",
    emoji: "🤖",
    coverImage: "/gallery/Lara/Lara2.png",
    images: [
      "/gallery/Lara/Lara2.png",
      "/gallery/Lara/Lara3.png",
      "/gallery/Lara/Lara1.png",
      "/gallery/Lara/Lara4.png",
      "/gallery/Lara/Lara5.png",
      "/gallery/Lara/Lara6.png"
    ],
    additionalProducts: buildAdditionalProducts("Lara"),
    tagline: "Engenharia, amizade e muita tecnologia na floresta!",
    description: "A inteligente Lara embarca em uma jornada tecnológica ao lado de simpáticos robôs e fadas da floresta. Juntos, eles decifram mistérios e consertam engrenagens mágicas.",
    bookTitle: "A Grande Missão de Lara",
    quote: "Lara apertou o último parafuso e sorriu. Com criatividade e amizade, ela provou que a tecnologia e a natureza andam sempre de mãos dadas."
  },
  {
    id: "s4",
    theme: "trem",
    title: "Noah e o Trem de Prata",
    age: "5 anos",
    emoji: "🚂",
    coverImage: "/gallery/Noah/Noah2.png",
    images: [
      "/gallery/Noah/Noah2.png",
      "/gallery/Noah/Noah3.png",
      "/gallery/Noah/Noah1.png",
      "/gallery/Noah/Noah4.png",
      "/gallery/Noah/Noah5.png",
      "/gallery/Noah/Noah6.png"
    ],
    additionalProducts: buildAdditionalProducts("Noah"),
    tagline: "Uma viagem inesquecível sobre os trilhos da imaginação!",
    description: "A bordo do lendário Trem de Prata, Noah viaja por montanhas majestosas guiando a locomotiva com seu mapa misterioso. Uma história de descoberta, velocidade e companheirismo.",
    bookTitle: "O Segredo do Trem de Prata",
    quote: "Noah olhou para o horizonte sabendo que, nos trilhos da vida, a melhor parte da viagem é quem está ao nosso lado."
  },
  {
    id: "s5",
    theme: "floresta_encantada",
    title: "Ravi e a Cachoeira Mágica",
    age: "3 anos",
    emoji: "🌳",
    coverImage: "/gallery/Ravi/Ravi2.png",
    images: [
      "/gallery/Ravi/Ravi2.png",
      "/gallery/Ravi/Ravi3.png",
      "/gallery/Ravi/Ravi1.png",
      "/gallery/Ravi/Ravi4.png",
      "/gallery/Ravi/Ravi5.png",
      "/gallery/Ravi/Ravi6.png"
    ],
    additionalProducts: buildAdditionalProducts("Ravi"),
    tagline: "Descobertas sob o arco-íris da floresta tropical!",
    description: "O pequeno Ravi adora a natureza e embarca em uma trilha cheia de fadas e cachoeiras cristalinas. Ele aprende a ouvir a voz dos animais e a ver a magia escondida nas pequenas coisas.",
    bookTitle: "Aventura na Cachoeira",
    quote: "Ravi sentiu a brisa fresca da água cair e percebeu que a floresta é um lar mágico onde cada árvore conta uma história de amor."
  }
] as const;

export const PRODUCT_SHOWCASE_MEDIA = {
  LIVRO_PRINCIPAL: GALLERY_SAMPLES.flatMap((sample) => sample.images),
  EBOOK: GALLERY_SAMPLES.flatMap((sample) =>
    sample.additionalProducts
      .filter((product) => product.type === "EBOOK")
      .flatMap((product) => product.images),
  ),
  LIVRO_COLORIR: GALLERY_SAMPLES.flatMap((sample) =>
    sample.additionalProducts
      .filter((product) => product.type === "LIVRO_COLORIR")
      .flatMap((product) => product.images),
  ),
  QUEBRA_CABECA: GALLERY_SAMPLES.flatMap((sample) =>
    sample.additionalProducts
      .filter((product) => product.type === "QUEBRA_CABECA")
      .flatMap((product) => product.images),
  ),
  CARTELA_ADESIVOS: GALLERY_SAMPLES.flatMap((sample) =>
    sample.additionalProducts
      .filter((product) => product.type === "CARTELA_ADESIVOS")
      .flatMap((product) => product.images),
  ),
} as const;

export const BOOK_COVER_SHOWCASE_MEDIA = GALLERY_SAMPLES.map((sample) => sample.coverImage);
