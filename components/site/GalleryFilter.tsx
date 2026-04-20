"use client";

import { useMemo, useState } from "react";

type Theme = { slug: string; label: string };
type Sample = {
  id: string;
  theme: string;
  title: string;
  age: string;
  emoji: string;
};

type Props = {
  themes: Theme[];
  samples: Sample[];
};

export default function GalleryFilter({ themes, samples }: Props) {
  const [active, setActive] = useState<string>("todos");

  const filtered = useMemo(() => {
    if (active === "todos") return samples;
    return samples.filter((s) => s.theme === active);
  }, [active, samples]);

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {themes.map((t) => {
          const isActive = t.slug === active;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => setActive(t.slug)}
              aria-pressed={isActive}
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                isActive
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-dark/70 border-primary/20 hover:border-primary"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-dark/60 py-12">
          Nenhuma história nesse tema ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((s) => (
            <article
              key={s.id}
              className="bg-white rounded-2xl overflow-hidden border border-primary/10 shadow-sm"
            >
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-7xl">
                <span aria-hidden>{s.emoji}</span>
              </div>
              <div className="p-4">
                <h3 className="font-serif text-lg text-dark">{s.title}</h3>
                <p className="text-xs text-dark/60 mt-1">{s.age}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
