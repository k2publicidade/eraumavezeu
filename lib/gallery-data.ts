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
};

export const GALLERY_SAMPLES: readonly GallerySample[] = [
  {
    id: "s1",
    theme: "dinossauros",
    title: "Theo e o T-Rex amigo",
    age: "4 anos",
    emoji: "🦖",
  },
  {
    id: "s2",
    theme: "princesas",
    title: "Sofia no reino encantado",
    age: "5 anos",
    emoji: "👑",
  },
  {
    id: "s3",
    theme: "robos",
    title: "Davi e os robôs do futuro",
    age: "7 anos",
    emoji: "🤖",
  },
  {
    id: "s4",
    theme: "floresta_encantada",
    title: "Alice na floresta",
    age: "3 anos",
    emoji: "🌳",
  },
  {
    id: "s5",
    theme: "trem",
    title: "Miguel no trem do tempo",
    age: "6 anos",
    emoji: "🚂",
  },
  {
    id: "s6",
    theme: "dinossauros",
    title: "Laura e o Bebê Dino",
    age: "3 anos",
    emoji: "🥚",
  },
  {
    id: "s7",
    theme: "princesas",
    title: "Helena e a torre",
    age: "5 anos",
    emoji: "🏰",
  },
  {
    id: "s8",
    theme: "robos",
    title: "Lucas salva o planeta",
    age: "8 anos",
    emoji: "🚀",
  },
] as const;
