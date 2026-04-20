import {
  AGE_RANGES,
  ART_STYLES,
  COLORS,
  GENRES,
  THEMES,
  type AgeRange,
  type ArtStyle,
  type Color,
  type Genre,
  type Theme,
} from "./types";

export type PromptInput = {
  theme: Theme;
  genre: Genre;
  artStyle: ArtStyle;
  favoriteColor: Color;
  ageRange: AgeRange;
  childName: string;
  dedication?: string | null;
  photoCount: number;
};

function labelOf<T extends { slug: string; label: string }>(
  list: readonly T[],
  slug: string,
): string {
  const found = list.find((x) => x.slug === slug);
  if (!found) throw new Error(`Unknown slug: ${slug}`);
  return found.label;
}

/**
 * Gera o prompt PT-BR que será usado pela equipe de produção
 * em ferramentas externas de IA (Midjourney, DALL-E, Leonardo, etc.).
 *
 * Função pura — sem I/O, sem side effects. Testada em isolamento.
 * Outputs sempre em PT-BR porque os ilustradores brasileiros leem o prompt.
 */
export function gerarPromptIA(input: PromptInput): string {
  const theme = labelOf(THEMES, input.theme);
  const genre = labelOf(GENRES, input.genre);
  const style = labelOf(ART_STYLES, input.artStyle);
  const color = labelOf(COLORS, input.favoriteColor);
  const age = labelOf(AGE_RANGES, input.ageRange);
  const name = input.childName.trim();

  if (!name) throw new Error("childName is required");

  const lines: string[] = [
    `# Livro personalizado — ${name}`,
    ``,
    `## Parâmetros`,
    `- **Protagonista:** ${name}`,
    `- **Faixa etária:** ${age}`,
    `- **Tema:** ${theme}`,
    `- **Gênero narrativo:** ${genre}`,
    `- **Estilo visual:** ${style}`,
    `- **Cor predominante da paleta:** ${color}`,
    `- **Fotos de referência disponíveis:** ${input.photoCount} (usar somente como referência das feições, não copiar composição)`,
    ``,
    `## Briefing para a equipe`,
    `Gerar 20 ilustrações em estilo ${style.toLowerCase()}, com paleta dominante em ${color.toLowerCase()}, narrando uma história de ${genre.toLowerCase()} no universo "${theme}". A criança protagonista chama-se ${name} e tem ${age}. Manter consistência facial entre páginas usando as fotos de referência; jamais incluir marca, logo ou texto nas ilustrações. Cada página precisa contar um momento específico da jornada (começo → conflito → solução → desfecho) adequado à faixa etária.`,
  ];

  if (input.dedication && input.dedication.trim().length > 0) {
    lines.push("");
    lines.push(`## Dedicatória (imprimir em Dancing Script na página de rosto)`);
    lines.push(`> ${input.dedication.trim()}`);
  }

  return lines.join("\n");
}
