import type { Metadata } from "next";
import { Inter, Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Era Uma Vez Eu — Livros infantis personalizados com IA",
    template: "%s | Era Uma Vez Eu",
  },
  description:
    "Transforme a criança que você ama no herói da própria história. Livros infantis personalizados com ilustrações únicas criadas por IA.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Era Uma Vez Eu",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}
    >
      <body className="font-sans bg-cream text-dark antialiased">
        {children}
      </body>
    </html>
  );
}
