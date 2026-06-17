import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://eraumavezeu.com.br";

const PUBLIC_ROUTES = [
  "",
  "como-funciona",
  "produtos",
  "para-todas-ocasioes",
  "galeria",
  "faq",
  "quem-somos",
  "contato",
  "privacidade",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_ROUTES.map((path) => ({
    url: path ? `${SITE_URL}/${path}` : SITE_URL,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1.0 : 0.7,
  }));
}
