export const THEMES = [
  { slug: "dinossauros", label: "Dinossauros" },
  { slug: "floresta_encantada", label: "Floresta Encantada" },
  { slug: "trem", label: "Aventura no Trem" },
  { slug: "princesas", label: "Princesas" },
  { slug: "robos", label: "Robôs" },
] as const;

export const GENRES = [
  { slug: "acao", label: "Ação" },
  { slug: "comedia", label: "Comédia" },
  { slug: "aventura", label: "Aventura" },
  { slug: "misterio", label: "Mistério" },
  { slug: "conto_de_fadas", label: "Conto de Fadas" },
] as const;

export const ART_STYLES = [
  { slug: "realista", label: "Realista" },
  { slug: "lapiz", label: "Lápis de cor" },
  { slug: "computadorizado", label: "3D / Computadorizado" },
] as const;

export const COLORS = [
  { slug: "laranja", label: "Laranja", hex: "#D97B2B" },
  { slug: "roxo", label: "Roxo", hex: "#5B2D8E" },
  { slug: "verde", label: "Verde", hex: "#2E8B57" },
  { slug: "azul", label: "Azul", hex: "#1E6FB8" },
  { slug: "rosa", label: "Rosa", hex: "#E05A8E" },
  { slug: "amarelo", label: "Amarelo", hex: "#E8B923" },
] as const;

export const AGE_RANGES = [
  { slug: "0-3", label: "0 a 3 anos" },
  { slug: "4-6", label: "4 a 6 anos" },
  { slug: "7-10", label: "7 a 10 anos" },
] as const;

export type Theme = (typeof THEMES)[number]["slug"];
export type Genre = (typeof GENRES)[number]["slug"];
export type ArtStyle = (typeof ART_STYLES)[number]["slug"];
export type Color = (typeof COLORS)[number]["slug"];
export type AgeRange = (typeof AGE_RANGES)[number]["slug"];

export type UploadedPhoto = {
  fileKey: string;
  url: string;
  name: string;
};

export type WizardState = {
  step: number; // 1..7
  theme: Theme | null;
  genre: Genre | null;
  artStyle: ArtStyle | null;
  favoriteColor: Color | null;
  ageRange: AgeRange | null;
  childName: string;
  dedication: string;
  photos: UploadedPhoto[];
  consentAcceptedAt: string | null;
  consentTextVersion: string;
};

export const CONSENT_TEXT_VERSION = "v1-2026-04-20";
export const CONSENT_TEXT =
  "Declaro ser o pai, mãe ou responsável legal da criança cuja foto estou enviando, e autorizo o uso das fotos exclusivamente como referência para criação do livro personalizado, com marca d'água em qualquer preview público e exclusão automática 90 dias após a entrega (LGPD Art. 14).";

export const WIZARD_STEPS = [
  { n: 1, key: "theme", title: "Tema" },
  { n: 2, key: "genre", title: "Gênero" },
  { n: 3, key: "artStyle", title: "Estilo" },
  { n: 4, key: "color", title: "Cor favorita" },
  { n: 5, key: "age", title: "Faixa etária" },
  { n: 6, key: "photos", title: "Fotos + nome" },
  { n: 7, key: "dedication", title: "Dedicatória" },
] as const;

export const MAX_PHOTOS = 4;
