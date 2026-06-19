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
  beforeImage: string;
  afterImage: string;
  tagline: string;
  description: string;
  bookTitle: string;
  quote: string;
};

export const GALLERY_SAMPLES: readonly GallerySample[] = [
  {
    id: "s1",
    theme: "dinossauros",
    title: "Theo e o T-Rex amigo",
    age: "4 anos",
    emoji: "🦖",
    beforeImage: "/gallery/theo_before.png",
    afterImage: "/gallery/theo_after.png",
    tagline: "Uma amizade jurássica repleta de coragem e imaginação!",
    description: "O pequeno Theo é apaixonado pela era dos dinossauros. A partir de fotos enviadas por seus pais, nossa IA capturou o olhar curioso e o sorriso expressivo de Theo para criar um personagem 3D estilo Pixar. Na história, ele faz amizade com um adorável filhote de T-Rex e se aventura por florestas pré-históricas.",
    bookTitle: "Theo e a Grande Aventura Pré-Histórica",
    quote: "E assim, com a ajuda de Theo, o T-Rex aprendeu que o maior poder de todos é um coração valente.",
  },
  {
    id: "s2",
    theme: "princesas",
    title: "Sofia no reino encantado",
    age: "5 anos",
    emoji: "👑",
    beforeImage: "/gallery/sofia_before.png",
    afterImage: "/gallery/sofia_after.png",
    tagline: "Uma princesa moderna liderando com sabedoria e empatia.",
    description: "Para a Sofia, queríamos retratar seus cachos marcantes e seu brilho carismático. Ela foi ilustrada em estilo aquarela clássico de contos de fadas, vestindo um lindo vestido rosa de realeza. No livro, a Princesa Sofia lidera uma missão para salvar as flores mágicas do reino.",
    bookTitle: "Princesa Sofia e as Flores de Ouro",
    quote: "Sofia sorriu, sabendo que a verdadeira magia reside na bondade com que tratamos os outros.",
  },
  {
    id: "s3",
    theme: "robos",
    title: "Davi e os robôs do futuro",
    age: "7 anos",
    emoji: "🤖",
    beforeImage: "/gallery/davi_before.png",
    afterImage: "/gallery/davi_after.png",
    tagline: "Engenharia espacial e diversão nas estrelas!",
    description: "Davi é fascinado por ciências e usa óculos marcantes. A ilustração 3D capturou perfeitamente sua feição esperta e seus óculos. Ele se torna o capitão de uma nave e, ao lado de um simpático robô de lata, conserta o gerador solar da Cidade Flutuante.",
    bookTitle: "Davi e os Defensores do Amanhã",
    quote: "Com inteligência e trabalho em equipe, Davi e seu robô provaram que nenhuma engrenagem é pequena demais para ajudar.",
  },
  {
    id: "s4",
    theme: "floresta_encantada",
    title: "Alice na floresta",
    age: "3 anos",
    emoji: "🌳",
    beforeImage: "/gallery/alice_before.png",
    afterImage: "/gallery/alice_after.png",
    tagline: "Uma jornada mágica entre luzes, fadas e criaturas falantes.",
    description: "A pequena Alice adora marias-chiquinhas e bichinhos de pelúcia. Suas fotos sorrindo inspiraram uma ilustração lúdica e suave. Ela segue o caminho de borboletas luminosas para ajudar uma fada a reencontrar sua varinha de condão perdida.",
    bookTitle: "Alice e o Mistério da Floresta Brilhante",
    quote: "A cada passo dado por Alice, a floresta cantava com uma luz suave, revelando que a magia está em todo lugar.",
  },
] as const;

