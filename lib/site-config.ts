export const SITE_NAME = "Era Uma Vez Eu";

export const SITE_TAGLINE =
  "Livros infantis personalizados com ilustrações criadas por IA.";

export const WHATSAPP_NUMBER = "5521975128634";

export const WHATSAPP_DISPLAY = "(21) 97512-8634";

export const WHATSAPP_MESSAGE_DEFAULT =
  "Olá! Vim pelo site e quero saber mais sobre o livro personalizado.";

export const CONTACT_EMAIL = "atendimento@eraumavezeu.com.br";

export const CNPJ = "60.765.718/0001-09";

export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Como Funciona", href: "/como-funciona" },
  { label: "Produtos", href: "/produtos" },
  { label: "Para Todas Ocasiões", href: "/para-todas-ocasioes" },
  { label: "Galeria", href: "/galeria" },
  { label: "FAQ", href: "/faq" },
  { label: "Contato", href: "/contato" },
] as const;

export type SocialLink = {
  label: string;
  href: string;
  platform: "instagram" | "tiktok";
};

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    label: "@eraumavez.eu_",
    href: "https://instagram.com/eraumavez.eu_",
    platform: "instagram",
  },
  {
    label: "@era.uma.vez_eu",
    href: "https://tiktok.com/@era.uma.vez_eu",
    platform: "tiktok",
  },
] as const;

export const PRIMARY_CTA = { label: "Criar meu livro", href: "/personalizar" };
