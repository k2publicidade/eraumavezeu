import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

async function getPage(slug: string) {
  return db.contentPage.findFirst({ where: { slug, published: true } });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPage(params.slug);
  if (!page) return {};
  return { title: page.seoTitle || page.title, description: page.seoDescription || page.summary || undefined, openGraph: { title: page.seoTitle || page.title, description: page.seoDescription || page.summary || undefined, images: page.heroImage ? [page.heroImage] : undefined } };
}

function renderBody(body: string) {
  const lines = body.split(/\r?\n/);
  return lines.map((line, index) => {
    const text = line.trim();
    if (!text) return <div key={index} className="h-3" />;
    if (text.startsWith("## ")) return <h2 key={index} className="mt-9 font-serif text-2xl text-primary">{text.slice(3)}</h2>;
    if (text.startsWith("# ")) return <h2 key={index} className="mt-9 font-serif text-3xl text-primary">{text.slice(2)}</h2>;
    if (text.startsWith("- ")) return <p key={index} className="ml-5 flex gap-3"><span className="text-gold">•</span><span>{text.slice(2)}</span></p>;
    return <p key={index}>{text}</p>;
  });
}

export default async function CmsPublicPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);
  if (!page) notFound();
  return <main className="bg-cream py-16 md:py-24"><article className="container mx-auto max-w-4xl px-4"><header className="text-center">{page.eyebrow && <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">{page.eyebrow}</p>}<h1 className="mt-3 font-serif text-4xl leading-tight text-primary md:text-6xl">{page.title}</h1>{page.summary && <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-dark/65">{page.summary}</p>}</header>{page.heroImage && <div className="relative mt-10 aspect-[16/8] overflow-hidden rounded-[2rem] border border-gold/20 bg-white"><Image src={page.heroImage} alt="" fill className="object-cover" sizes="(max-width: 900px) 100vw, 900px" priority /></div>}<div className="mt-12 space-y-3 text-base leading-8 text-dark/75 md:text-lg">{renderBody(page.body)}</div>{page.ctaLabel && page.ctaHref && <div className="mt-12 text-center"><Link href={page.ctaHref} className="btn-primary inline-flex">{page.ctaLabel}</Link></div>}</article></main>;
}
