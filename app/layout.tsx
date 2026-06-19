import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Dancing_Script } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
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
      className={`${plusJakarta.variable} ${inter.variable} ${dancing.variable}`}
    >
      <body className="font-sans bg-cream text-dark antialiased">
        {children}
      </body>
    </html>
  );
}
