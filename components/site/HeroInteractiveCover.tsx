"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COLORS, THEMES } from "@/lib/wizard/types";
import type { Theme, Color } from "@/lib/wizard/types";
import { useWizardStore } from "@/lib/wizard/store";
import HeroScrollVideo from "./HeroScrollVideo";

const THEME_EMOJIS: Record<string, string> = {
  dinossauros: "🦖",
  floresta_encantada: "🦊",
  trem: "🚂",
  princesas: "👑",
  robos: "🤖",
};

const THEME_LABELS: Record<string, string> = {
  dinossauros: "Dinossauros",
  floresta_encantada: "Floresta Encantada",
  trem: "Aventura no Trem",
  princesas: "Princesas",
  robos: "Robôs",
};

export default function HeroInteractiveCover() {
  const router = useRouter();
  const [name, setName] = useState("Sofia");
  const [activeColor, setActiveColor] = useState("azul");
  const [activeTheme, setActiveTheme] = useState("floresta_encantada");

  // Dedicatória gerada dinamicamente para sincronização do funil
  const dedication = `Para ${name.trim() || "você"}, que esta história seja apenas o começo de suas grandes aventuras! Com todo o nosso amor e carinho.`;

  // Salva os dados no store global do wizard antes de avançar, sincronizando o marketing com o funil
  const handleStart = () => {
    const store = useWizardStore.getState();
    store.setTheme(activeTheme as Theme);
    store.setColor(activeColor as Color);
    store.setChildName(name.trim());
    store.setDedication(dedication);
    router.push(`/personalizar?theme=${activeTheme}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto lg:mx-0 select-none">
      {/* Scroll-driven Video Animation replaces the 3D book preview */}
      <HeroScrollVideo />

      {/* Painel de Controle */}
      <div className="bg-cream-light rounded-3xl p-5 border border-gold/25 shadow-sm space-y-4">
        {/* Nome da Criança */}
        <div>
          <label htmlFor="hero-child-name" className="block text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1.5">
            Nome da Criança
          </label>
          <input
            id="hero-child-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 14))}
            placeholder="Digite um nome..."
            className="w-full bg-white border border-gold/30 rounded-xl px-4 py-2 text-sm text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          />
        </div>

        {/* Seleção de Cor Favorita */}
        <div>
          <span className="block text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1.5">
            Cor Favorita
          </span>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setActiveColor(c.slug)}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                  activeColor === c.slug 
                    ? "border-primary scale-125 ring-2 ring-primary/20" 
                    : "border-transparent hover:scale-110"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
                aria-label={`Cor ${c.label}`}
              />
            ))}
          </div>
        </div>

        {/* Seleção do Tema */}
        <div>
          <span className="block text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1.5">
            Universo da História
          </span>
          <div className="flex flex-wrap gap-1.5">
            {THEMES.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setActiveTheme(t.slug)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all duration-300 ${
                  activeTheme === t.slug
                    ? "bg-primary text-cream border-primary shadow-sm"
                    : "bg-white text-dark/70 border-gold/25 hover:border-gold hover:bg-cream/20"
                }`}
              >
                {THEME_EMOJIS[t.slug]} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botão de Chamada para Ação */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full bg-fox text-cream hover:bg-fox-light active:scale-98 py-3 rounded-full font-bold uppercase tracking-wider text-xs transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <span>PERSONALIZAR ESTE LIVRO</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
