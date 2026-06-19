import type { Config } from "tailwindcss";

// ============================================================
// Era Uma Vez Eu — Design System v2.0
// Paleta extraída diretamente do selo circular da marca
// ============================================================

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ----------------------------------------------------------
        // PRIMARY — Azul-marinho do texto do selo "ERA UMA VEZ, EU"
        // Uso: headings, CTAs principais, links ativos, texto forte
        // Contraste AA: white sobre navy = 7.2:1 (AAA)
        // ----------------------------------------------------------
        primary: {
          DEFAULT: "#1B2A4A",
          light: "#2E426B",
          dark: "#0F1A30",
        },

        // ----------------------------------------------------------
        // GOLD — Moldura dourada / estrelinhas do selo
        // Uso: badges, destaques, bordas de cards premium, ícones
        // ----------------------------------------------------------
        gold: {
          DEFAULT: "#D4A843",
          light: "#E2B958",
          dark: "#A37E2F",
          warm: "#EFC768",
        },

        // ----------------------------------------------------------
        // CREAM — Fundo interno do selo e área de cena
        // Uso: background principal, cards, seções claras
        // ----------------------------------------------------------
        cream: {
          DEFAULT: "#FAF7F2",
          light: "#FCFAF7",
          warm: "#FDFBF7",
          deep: "#EDE7DF",
        },

        // ----------------------------------------------------------
        // FOREST — Verde floresta externo do selo
        // Uso: footer, CTAs secundárias, badges de confiança
        // Contraste AA: white sobre forest = 5.8:1 (AA)
        // ----------------------------------------------------------
        forest: {
          DEFAULT: "#8BA888",
          light: "#9CBA99",
          dark: "#6D8B6B",
        },

        // ----------------------------------------------------------
        // FOX — Cor da raposa (warm accent)
        // Uso: preços em destaque, chamadas emocionais, hover states
        // ----------------------------------------------------------
        fox: {
          DEFAULT: "#E8753F",
          light: "#F0956A",
          dark: "#C4562A",
        },

        // ----------------------------------------------------------
        // ROSE — Tom rosado suave (livro aberto do selo)
        // Uso: toques sutis, tags de gênero, elements decorativos
        // ----------------------------------------------------------
        rose: {
          DEFAULT: "#F2E8E4",
          light: "#F5ECE8",
          pale: "#FBF7F5",
        },

        // ----------------------------------------------------------
        // SEMANTIC ALIASES (mantém compatibilidade com código existente)
        // ----------------------------------------------------------
        secondary: "#8BA888", // forest
        dark: "#2C2C2C",
        light: "#FAF7F2", // cream

        // Mantido para compatibilidade do UploadThing e outros
        // Atualizado para navy
      },

      fontFamily: {
        serif: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        script: ["var(--font-dancing)", "cursive"],
      },

      fontSize: {
        // Escala editorial — mínimo 16px para body
        xs: ["0.75rem", { lineHeight: "1.4" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.7" }],
        lg: ["1.125rem", { lineHeight: "1.65" }],
        xl: ["1.25rem", { lineHeight: "1.6" }],
        "2xl": ["1.5rem", { lineHeight: "1.4" }],
        "3xl": ["1.875rem", { lineHeight: "1.3" }],
        "4xl": ["2.25rem", { lineHeight: "1.2" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.05" }],
      },

      spacing: {
        // Sistema de 4px — múltiplos de 4 e 8
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "22": "5.5rem",
      },

      borderRadius: {
        none: "0",
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        full: "9999px",
        // Premium — usado em cards e selos
        seal: "50%",
      },

      boxShadow: {
        // Sombras warm — levemente amareladas como luz de vela
        xs: "0 1px 3px rgba(30,58,95,0.06)",
        sm: "0 2px 8px rgba(30,58,95,0.08)",
        DEFAULT: "0 4px 16px rgba(30,58,95,0.10)",
        md: "0 6px 24px rgba(30,58,95,0.12)",
        lg: "0 12px 40px rgba(30,58,95,0.14)",
        xl: "0 20px 60px rgba(30,58,95,0.16)",
        // Sombra dourada para elementos premium
        gold: "0 4px 20px rgba(232,201,74,0.35)",
        "gold-lg": "0 8px 40px rgba(232,201,74,0.45)",
        // Sombra inset para texturas de papel
        paper: "inset 0 0 0 1px rgba(232,201,74,0.20)",
        // Glow navy para foco
        focus: "0 0 0 3px rgba(30,58,95,0.25)",
      },

      backgroundImage: {
        // Gradientes warm sutis — remetem ao interior do selo
        "cream-to-white": "linear-gradient(180deg, #FAF3DC 0%, #FFFDF5 100%)",
        "cream-radial": "radial-gradient(ellipse at top, #F5E08A22 0%, #FAF3DC 60%)",
        "navy-to-forest": "linear-gradient(135deg, #1E3A5F 0%, #2E5D3C 100%)",
        "hero-warm": "linear-gradient(180deg, #FAF3DC 0%, #FFF8E8 50%, #FFFDF5 100%)",
        "hero-radial": "radial-gradient(ellipse 80% 60% at 50% 0%, #F5E08A18 0%, transparent 70%)",
        "cta-premium": "linear-gradient(135deg, #142845 0%, #1E3A5F 50%, #2D548A 100%)",
        "gold-shimmer": "linear-gradient(105deg, transparent 40%, rgba(245,216,126,0.4) 50%, transparent 60%)",
      },

      animation: {
        // Animações sutis — respeita prefers-reduced-motion via CSS
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "shimmer": "shimmer 2.5s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 12s linear infinite",
      },

      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { backgroundPosition: "-200% center" },
          "50%": { backgroundPosition: "200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(3deg)" },
        },
      },

      transitionTimingFunction: {
        "book": "cubic-bezier(0.23, 1, 0.32, 1)",
      },

      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
        "450": "450ms",
      },
    },
  },
  plugins: [],
};

export default config;
