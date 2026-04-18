import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#D97B2B",
          dark: "#B5611A",
        },
        secondary: "#5B2D8E",
        dark: "#1A1A2E",
        light: "#FFF8F2",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        script: ["var(--font-dancing)", "cursive"],
      },
    },
  },
  plugins: [],
};

export default config;
