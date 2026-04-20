import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://eraumavezeu.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/cliente", "/api/", "/personalizar"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
