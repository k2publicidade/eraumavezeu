import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/lib/db";

export type SiteSettings = {
  siteName: string;
  siteTagline: string;
  cnpj: string;
  contactEmail: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  whatsappMessageDefault: string;
  instagramLabel: string;
  instagramHref: string;
  tiktokLabel: string;
  tiktokHref: string;
  heroEyebrow: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroDescription: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  contactResponseTime: string;
};

export type SiteSettingRecord = {
  key: string;
  value: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "Era Uma Vez Eu",
  siteTagline: "Livros infantis personalizados com ilustrações criadas por IA.",
  cnpj: "60.765.718/0001-09",
  contactEmail: "atendimento@eraumavezeu.com.br",
  whatsappNumber: "5521975128634",
  whatsappDisplay: "(21) 97512-8634",
  whatsappMessageDefault:
    "Olá! Vim pelo site e quero saber mais sobre o livro personalizado.",
  instagramLabel: "@eraumavez.eu_",
  instagramHref: "https://instagram.com/eraumavez.eu_",
  tiktokLabel: "@era.uma.vez_eu",
  tiktokHref: "https://tiktok.com/@era.uma.vez_eu",
  heroEyebrow: "Era uma vez…",
  heroTitlePrefix: "Transforme a criança que você ama no",
  heroTitleHighlight: "herói da própria história",
  heroDescription:
    "Livros infantis personalizados com ilustrações únicas criadas por IA e revisão humana. Capa dura, impressão premium, entrega em todo Brasil.",
  primaryCtaLabel: "Criar meu livro",
  primaryCtaHref: "/personalizar",
  secondaryCtaLabel: "Como funciona",
  secondaryCtaHref: "/como-funciona",
  contactResponseTime: "Tempo médio de resposta: até 1h em horário comercial (9h–18h, seg a sex).",
};

export const SITE_SETTING_FIELDS: Array<{
  key: keyof SiteSettings;
  label: string;
  type: "text" | "email" | "url" | "textarea";
  help?: string;
}> = [
  { key: "siteName", label: "Nome do site", type: "text" },
  { key: "siteTagline", label: "Resumo da marca", type: "textarea" },
  { key: "cnpj", label: "CNPJ", type: "text" },
  { key: "contactEmail", label: "E-mail de atendimento", type: "email" },
  { key: "whatsappNumber", label: "WhatsApp com DDI/DDD", type: "text", help: "Somente números. Ex.: 5521975128634" },
  { key: "whatsappDisplay", label: "WhatsApp exibido", type: "text" },
  { key: "whatsappMessageDefault", label: "Mensagem padrão do WhatsApp", type: "textarea" },
  { key: "instagramLabel", label: "Instagram exibido", type: "text" },
  { key: "instagramHref", label: "Link do Instagram", type: "url" },
  { key: "tiktokLabel", label: "TikTok exibido", type: "text" },
  { key: "tiktokHref", label: "Link do TikTok", type: "url" },
  { key: "heroEyebrow", label: "Texto pequeno do hero", type: "text" },
  { key: "heroTitlePrefix", label: "Título do hero", type: "text" },
  { key: "heroTitleHighlight", label: "Destaque do título", type: "text" },
  { key: "heroDescription", label: "Descrição do hero", type: "textarea" },
  { key: "primaryCtaLabel", label: "CTA principal", type: "text" },
  { key: "primaryCtaHref", label: "Link do CTA principal", type: "text" },
  { key: "secondaryCtaLabel", label: "CTA secundário", type: "text" },
  { key: "secondaryCtaHref", label: "Link do CTA secundário", type: "text" },
  { key: "contactResponseTime", label: "Prazo de resposta do contato", type: "textarea" },
];

export const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  {
    id: "prazo-entrega",
    question: "Quanto tempo demora para receber o livro?",
    answer:
      "Após a confirmação do pagamento e envio da foto, levamos de 10 a 15 dias úteis para gerar as imagens, revisar, imprimir e despachar. O prazo dos correios/transportadora varia conforme o seu CEP.",
    sortOrder: 10,
    active: true,
  },
  {
    id: "ia-revisao-humana",
    question: "As ilustrações são feitas 100% por IA?",
    answer:
      "Usamos IA como ferramenta, mas toda página passa por revisão humana da nossa equipe. Nada é publicado sem aprovação manual.",
    sortOrder: 20,
    active: true,
  },
  {
    id: "fotos-publicas",
    question: "As fotos que envio ficam públicas?",
    answer:
      "Não. Ficam em bucket privado com URL não-listada, marca d'água em qualquer preview público e são deletadas automaticamente 90 dias após a entrega. Você pode pedir exclusão antes disso.",
    sortOrder: 30,
    active: true,
  },
  {
    id: "presente",
    question: "Sou avó/padrinho, posso comprar como presente?",
    answer:
      "Sim. O fluxo é pensado pra adultos comprarem pra crianças queridas — pais, tios, padrinhos, avós. Você preenche tudo no wizard.",
    sortOrder: 40,
    active: true,
  },
  {
    id: "pagamento",
    question: "Quais formas de pagamento vocês aceitam?",
    answer:
      "PIX (com desconto à vista), cartão de crédito com parcelamento sem juros em parcelas de 100 reais e boleto bancário via Mercado Pago.",
    sortOrder: 50,
    active: true,
  },
  {
    id: "faixa-etaria",
    question: "Qual a faixa etária recomendada?",
    answer:
      "De 0 a 10 anos. Oferecemos 3 faixas: 0-3 (histórias curtas, muitas imagens), 4-6 (aventuras simples), 7-10 (narrativas mais longas).",
    sortOrder: 60,
    active: true,
  },
  {
    id: "impressao",
    question: "O livro é impresso como?",
    answer:
      "Livro no formato 21x30 cm com capa dura de laminação premium e impressão profissional com cores fiéis. Contém 20 páginas em papel couché brilho (170 g/m²) e excelente acabamento, com lombada firme e miolo colado, sem uso de costuras ou grampos.",
    sortOrder: 70,
    active: true,
  },
  {
    id: "fotos-ideais",
    question: "Como devem ser as fotos que vou enviar?",
    answer:
      "A foto ideal deve ter boa iluminação (de preferência luz natural), mostrar o rosto da criança de frente, sem óculos escuros ou chapéus, com uma expressão neutra (e também uma sorrindo).",
    sortOrder: 80,
    active: true,
  },
  {
    id: "envio-brasil",
    question: "Vocês enviam pra todo o Brasil?",
    answer:
      "Sim, para todos os CEPs atendidos pelos Correios e transportadoras parceiras da Melhor Envio.",
    sortOrder: 90,
    active: true,
  },
  {
    id: "acompanhar-pedido",
    question: "Posso acompanhar o pedido?",
    answer:
      "Sim. Pela área do cliente você vê a timeline (pagamento, produção, envio) e o código de rastreamento quando disponível. Também recebe atualizações por e-mail e WhatsApp (opcional).",
    sortOrder: 100,
    active: true,
  },
  {
    id: "conta-obrigatoria",
    question: "Preciso criar conta pra comprar?",
    answer:
      "Não é obrigatório — aceitamos checkout como convidado. Mas criar conta facilita acompanhar pedidos e refazer com os mesmos dados.",
    sortOrder: 110,
    active: true,
  },
];

export function resolveSiteSettings(records: SiteSettingRecord[]): SiteSettings {
  const settings = { ...DEFAULT_SITE_SETTINGS };
  const validKeys = new Set(Object.keys(DEFAULT_SITE_SETTINGS));

  for (const record of records) {
    if (!validKeys.has(record.key) || record.value.trim() === "") continue;
    settings[record.key as keyof SiteSettings] = record.value.trim();
  }

  return settings;
}

export function resolveFaqItems(records: FaqItem[]): FaqItem[] {
  const activeItems = records
    .filter((item) => item.active && item.question.trim() && item.answer.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return activeItems.length > 0 ? activeItems : DEFAULT_FAQ_ITEMS;
}

export function buildWhatsappHref(settings: SiteSettings) {
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    settings.whatsappMessageDefault,
  )}`;
}

export function socialLinksFromSettings(settings: SiteSettings) {
  return [
    {
      label: settings.instagramLabel,
      href: settings.instagramHref,
      platform: "instagram" as const,
    },
    {
      label: settings.tiktokLabel,
      href: settings.tiktokHref,
      platform: "tiktok" as const,
    },
  ];
}

export async function getSiteSettings(): Promise<SiteSettings> {
  noStore();

  try {
    const records = await db.siteSetting.findMany({
      select: { key: true, value: true },
    });

    return resolveSiteSettings(records);
  } catch (error) {
    console.error("Failed to load site settings", error);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function getAdminSiteSettingRecords() {
  noStore();

  try {
    return await db.siteSetting.findMany({ orderBy: { key: "asc" } });
  } catch (error) {
    console.error("Failed to load admin site setting records", error);
    return [];
  }
}

export async function getFaqItems({ includeInactive = false } = {}): Promise<FaqItem[]> {
  noStore();

  try {
    const records = await db.faqItem.findMany({
      where: includeInactive ? undefined : { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        question: true,
        answer: true,
        sortOrder: true,
        active: true,
      },
    });

    return includeInactive ? records : resolveFaqItems(records);
  } catch (error) {
    console.error("Failed to load FAQ items", error);
    return includeInactive ? [] : DEFAULT_FAQ_ITEMS;
  }
}
