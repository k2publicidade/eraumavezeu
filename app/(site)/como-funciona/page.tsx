import Link from "next/link";
import type { Metadata } from "next";
import { PRIMARY_CTA } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Como Funciona",
  description:
    "Do primeiro clique ao livro em casa: veja os 8 passos para criar um livro personalizado com IA e revisão humana.",
};

const STEPS = [
  {
    n: 1,
    title: "Escolha o tema",
    text: "Aventura, mundo mágico, super-herói, princesa, animais. Cada tema guia toda a história.",
  },
  {
    n: 2,
    title: "Personalize a criança",
    text: "Nome, idade, gênero, cor de pele, cabelo, olhos e traços especiais.",
  },
  {
    n: 3,
    title: "Envie fotos com segurança",
    text: "Até 4 fotos em ambiente privado. Usamos só como referência e deletamos 90 dias após a entrega.",
  },
  {
    n: 4,
    title: "Escreva a dedicatória",
    text: "Uma mensagem única de quem presenteia para a criança, impressa na primeira página em caligrafia.",
  },
  {
    n: 5,
    title: "Revisão da equipe",
    text: "Geramos o prompt de IA e nossa equipe produz as ilustrações com revisão humana a cada página.",
  },
  {
    n: 6,
    title: "Aprovação do livro",
    text: "Você recebe a prévia digital e aprova antes da impressão.",
  },
  {
    n: 7,
    title: "Impressão premium",
    text: "Capa dura, 20 páginas, papel couché fosco, encadernação de alta qualidade.",
  },
  {
    n: 8,
    title: "Entrega em casa",
    text: "Enviamos via Correios ou transportadora com código de rastreio.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-to-b from-light to-primary/5">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-dark">
            Como funciona
          </h1>
          <p className="mt-4 text-lg text-dark/70">
            Do primeiro clique ao livro na estante. 8 passos para criar uma
            história única.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <ol className="space-y-8">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-serif text-xl">
                  {s.n}
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-dark">{s.title}</h2>
                  <p className="mt-2 text-dark/70">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-16 text-center">
            <Link
              href={PRIMARY_CTA.href}
              className="inline-block bg-primary text-white px-8 py-4 rounded-full hover:bg-primary-dark transition text-lg font-medium shadow-lg"
            >
              {PRIMARY_CTA.label}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
