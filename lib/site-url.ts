const LOCAL_URL = "http://localhost:3000";

export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (!configured) return LOCAL_URL;
  const normalized = configured.startsWith("http")
    ? configured
    : `https://${configured}`;
  return normalized.replace(/\/+$/, "");
}
