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
  images: string[];
  tagline: string;
  description: string;
  bookTitle: string;
  quote: string;
};

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
    tagline: "Uma princesa corajosa guiando seu reino com amor e luz!",
    description: "Sofia descobre um reino mágico em apuros após as flores perderem seu brilho. Com sabedoria, bondade e um cetro mágico, ela lidera fadas e criaturas da floresta para trazer a luz de volta ao Reino da Luz.",
    bookTitle: "A Princesa e o Reino da Luz",
    quote: "Sofia sorriu, sabendo que a verdadeira realeza está no amor com que cuidamos do nosso mundo e de quem amamos."
  },
  {
    id: "s3",
    theme: "robos",
    title: "Lara e os Robôs",
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
    tagline: "Uma viagem inesquecível sobre os trilhos da imaginação!",
    description: "A bordo do lendário Trem de Prata, Noah viaja por montanhas majestosas guiando a locomotiva com seu mapa misterioso. Uma história de descoberta, velocidade e companheirismo.",
    bookTitle: "The Secret of the Silver Train",
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
    tagline: "Descobertas sob o arco-íris da floresta tropical!",
    description: "O pequeno Ravi adora a natureza e embarca em uma trilha cheia de fadas e cachoeiras cristalinas. Ele aprende a ouvir a voz dos animais e a ver a magia escondida nas pequenas coisas.",
    bookTitle: "Aventura na Cachoeira",
    quote: "Ravi sentiu a brisa fresca da água cair e percebeu que a floresta é um lar mágico onde cada árvore conta uma história de amor."
  }
] as const;
