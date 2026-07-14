import { z } from "zod";
import type { CustomizationSnapshot, ProductType } from "@/lib/cart/types";

export const PRODUCT_FORM_VERSION = "product-forms-v2-2026-07-14";
export const REQUIRED_PRODUCT_PHOTOS = 4;

export const GENDER_OPTIONS = [
  { value: "MENINO", label: "Menino" },
  { value: "MENINA", label: "Menina" },
  { value: "OUTRO", label: "Outra identidade" },
] as const;

export const COLOR_SUGGESTIONS = [
  "Azul", "Vermelho", "Amarelo", "Verde", "Rosa", "Roxo",
  "Laranja", "Preto", "Branco", "Cinza",
] as const;

export const ART_STYLE_OPTIONS = [
  { value: "REALISTA", label: "Realista", description: "Acabamento próximo de uma fotografia" },
  { value: "DESENHO", label: "Desenho", description: "Ilustração clássica e artística" },
  { value: "DIGITAL", label: "Animação digital", description: "Visual tridimensional e contemporâneo" },
] as const;

export const LINE_STYLE_OPTIONS = [
  { value: "SIMPLES", label: "Traço simples", description: "Áreas maiores e mais fáceis de colorir" },
  { value: "DETALHADO", label: "Traço detalhado", description: "Mais elementos e riqueza visual" },
] as const;

export const PRODUCT_FORM_LABELS: Record<ProductType, { title: string; shortTitle: string }> = {
  LIVRO_PRINCIPAL: { title: "Livro personalizado", shortTitle: "Livro" },
  EBOOK: { title: "E-book personalizado", shortTitle: "E-book" },
  LIVRO_COLORIR: { title: "Livro de colorir personalizado", shortTitle: "Livro de colorir" },
  QUEBRA_CABECA: { title: "Quebra-cabeça personalizado", shortTitle: "Quebra-cabeça" },
  CARTELA_ADESIVOS: { title: "Cartela de adesivos personalizada", shortTitle: "Adesivos" },
};

const productTypeSchema = z.enum([
  "LIVRO_PRINCIPAL", "EBOOK", "LIVRO_COLORIR", "QUEBRA_CABECA", "CARTELA_ADESIVOS",
]);

export const productCustomizationSchema = z.object({
  productType: productTypeSchema,
  childName: z.string().trim().min(2, "Informe o nome da criança.").max(80),
  childAge: z.number().int().min(0, "Informe uma idade válida.").max(17, "A idade máxima é 17 anos."),
  childGender: z.enum(["MENINO", "MENINA", "OUTRO"]),
  favoriteColor: z.string().trim().min(2, "Informe a cor favorita.").max(40),
  theme: z.string().trim().min(2, "Conte qual tema mais encanta a criança.").max(180),
  storyGenre: z.string().trim().max(100).optional().default(""),
  artStyle: z.string().trim().max(40).optional().default(""),
  lineStyle: z.string().trim().max(40).optional().default(""),
  dedication: z.string().trim().max(700).optional().default(""),
  notes: z.string().trim().min(2, "Inclua uma observação, mesmo que seja 'sem observações'.").max(1500),
  photoKeys: z.array(z.string().min(1)).length(
    REQUIRED_PRODUCT_PHOTOS,
    `Envie exatamente ${REQUIRED_PRODUCT_PHOTOS} fotos.`,
  ),
  consentAcceptedAt: z.string().datetime(),
  consentTextVersion: z.literal(PRODUCT_FORM_VERSION),
  confidentialityAcceptedAt: z.string().datetime(),
}).superRefine((data, ctx) => {
  const isBook = data.productType === "LIVRO_PRINCIPAL" || data.productType === "EBOOK";
  const needsStory = isBook || data.productType === "LIVRO_COLORIR";
  const needsArt = needsStory || data.productType === "QUEBRA_CABECA";

  if (needsStory && !data.storyGenre) {
    ctx.addIssue({ code: "custom", path: ["storyGenre"], message: "Informe o gênero da história." });
  }
  if (needsArt && !data.artStyle) {
    ctx.addIssue({ code: "custom", path: ["artStyle"], message: "Escolha o estilo das ilustrações." });
  }
  if (data.productType === "LIVRO_COLORIR" && !data.lineStyle) {
    ctx.addIssue({ code: "custom", path: ["lineStyle"], message: "Escolha o tipo de traço." });
  }
  if (isBook && !data.dedication) {
    ctx.addIssue({ code: "custom", path: ["dedication"], message: "Escreva a dedicatória do livro." });
  }
});

export type ProductCustomizationInput = z.input<typeof productCustomizationSchema>;
export type ProductCustomization = z.output<typeof productCustomizationSchema>;

export type ProductCustomizationDraft = Omit<ProductCustomization, "childAge"> & {
  childAge: number | null;
  photoUrls: Array<{ fileKey: string; url: string; name: string }>;
};

export function createCustomizationDraft(
  productType: ProductType,
  seed?: CustomizationSnapshot,
): ProductCustomizationDraft {
  const ageMatch = seed?.ageRange?.match(/\d+/);
  const artStyleMap: Record<string, string> = {
    realista: "REALISTA",
    lapiz: "DESENHO",
    computadorizado: "DIGITAL",
  };
  const favoriteColor = seed?.favoriteColor
    ? seed.favoriteColor.charAt(0).toUpperCase() + seed.favoriteColor.slice(1)
    : "";
  return {
    productType,
    childName: seed?.childName ?? "",
    childAge: ageMatch ? Number(ageMatch[0]) : null,
    childGender: "OUTRO",
    favoriteColor,
    theme: seed?.theme?.replaceAll("_", " ") ?? "",
    storyGenre: seed?.genre?.replaceAll("_", " ") ?? "",
    artStyle: seed?.artStyle ? (artStyleMap[seed.artStyle] ?? seed.artStyle) : "",
    lineStyle: "",
    dedication: seed?.dedication ?? "",
    notes: "",
    photoKeys: seed?.photoKeys ?? [],
    photoUrls: [],
    consentAcceptedAt: seed?.consentAcceptedAt ?? "",
    consentTextVersion: PRODUCT_FORM_VERSION,
    confidentialityAcceptedAt: "",
  };
}

export function toCustomizationPayload(draft: ProductCustomizationDraft): ProductCustomizationInput {
  const { photoUrls: _photoUrls, ...payload } = draft;
  return { ...payload, childAge: draft.childAge ?? -1 };
}

export function consentTextFor(productType: ProductType): string {
  const product = PRODUCT_FORM_LABELS[productType].title.toLowerCase();
  return `Declaro ser responsável legal pela criança e autorizo a Era Uma Vez, Eu a utilizar as imagens exclusivamente na criação deste item: ${product}. As fotos serão tratadas com acesso restrito e excluídas após o prazo de retenção informado na política de privacidade.`;
}

export const CONFIDENTIALITY_TEXT =
  "Li e compreendi o compromisso de confidencialidade: dados, fotos e informações da família serão usados somente na produção do pedido, sem uso promocional ou compartilhamento para outras finalidades.";

export function productNeedsStory(productType: ProductType): boolean {
  return productType === "LIVRO_PRINCIPAL" || productType === "EBOOK" || productType === "LIVRO_COLORIR";
}

export function productNeedsArt(productType: ProductType): boolean {
  return productNeedsStory(productType) || productType === "QUEBRA_CABECA";
}

export function buildProductionBrief(data: ProductCustomization): string {
  const lines = [
    `# Ficha de produção: ${PRODUCT_FORM_LABELS[data.productType].title}`,
    `- Criança: ${data.childName}, ${data.childAge} anos`,
    `- Identificação: ${GENDER_OPTIONS.find((item) => item.value === data.childGender)?.label ?? data.childGender}`,
    `- Cor favorita: ${data.favoriteColor}`,
    `- Tema: ${data.theme}`,
  ];
  if (data.storyGenre) lines.push(`- Gênero da história: ${data.storyGenre}`);
  if (data.artStyle) lines.push(`- Estilo visual: ${ART_STYLE_OPTIONS.find((item) => item.value === data.artStyle)?.label ?? data.artStyle}`);
  if (data.lineStyle) lines.push(`- Tipo de traço: ${LINE_STYLE_OPTIONS.find((item) => item.value === data.lineStyle)?.label ?? data.lineStyle}`);
  if (data.dedication) lines.push(`- Dedicatória: ${data.dedication}`);
  lines.push(`- Observações: ${data.notes}`);
  lines.push(`- Fotos de referência: ${data.photoKeys.length}`);
  return lines.join("\n");
}
