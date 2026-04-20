export const SITE_NAME = "Era Uma Vez Eu";

export const SITE_TAGLINE =
  "Livros infantis personalizados com ilustrações criadas por IA.";

export const WHATSAPP_NUMBER = "5511999999999";

export const WHATSAPP_MESSAGE_DEFAULT =
  "Olá! Vim pelo site e quero saber mais sobre o livro personalizado.";

export const CONTACT_EMAIL = "contato@eraumavezeu.com.br";

export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Como Funciona", href: "/como-funciona" },
  { label: "Produtos", href: "/produtos" },
  { label: "Galeria", href: "/galeria" },
  { label: "FAQ", href: "/faq" },
  { label: "Contato", href: "/contato" },
] as const;

export type SocialLink = {
  label: string;
  href: string;
  platform: "instagram" | "facebook" | "tiktok";
};

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    label: "Instagram",
    href: "https://instagram.com/eraumavezeu",
    platform: "instagram",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/eraumavezeu",
    platform: "facebook",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@eraumavezeu",
    platform: "tiktok",
  },
] as const;

export const PRIMARY_CTA = { label: "Criar meu livro", href: "/personalizar" };
