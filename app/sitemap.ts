import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

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
  "termos",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const standardRoutes: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((path) => ({
    url: path ? `${SITE_URL}/${path}` : SITE_URL,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1.0 : 0.7,
  }));

  try {
    const pages = await db.contentPage.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    return [...standardRoutes, ...pages.filter((page) => !PUBLIC_ROUTES.includes(page.slug)).map((page) => ({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))];
  } catch {
    return standardRoutes;
  }
}
