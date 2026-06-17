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
    title: "Escolha o Tema",
    text: "Qual é a paixão da criança? Uma aventura com dinossauros, uma jornada mágica na floresta encantada, uma viagem de trem, um conto de princesas, uma grande ação de super-herói ou comédia com robôs? A escolha é sua! Cada tema guia toda a história.",
  },
  {
    n: 2,
    title: "Escolha o Gênero",
    text: "Qual é o ritmo dessa jornada? O gênero define o tom da narrativa: Ação (para pequenos heróis que amam movimentos rápidos e superação), Comédia (boas gargalhadas com situações engraçadas), Aventura (explorar novos mundos e fazer grandes descobertas), Mistério (pequenos detetives que amam desvendar pistas) e Conto de Fadas (onde a magia e o encantamento guiam cada página).",
  },
  {
    n: 3,
    title: "Escolha o estilo de ilustração",
    text: "Realista (parece uma foto de filme!), Desenho a Lápis (clássico e artístico) ou Computadorizado (estilo animação digital).",
  },
  {
    n: 4,
    title: "Escolha a Cor Favorita",
    text: "Qual é o tom que faz os olhos da criança brilharem? A cor preferida do pequeno herói ou heroína vira protagonista nos detalhes da capa, nas molduras das páginas e em elementos mágicos da arte. Isso garante a identidade visual que ele(a) mais ama!",
  },
  {
    n: 5,
    title: "Escolha a Faixa Etária",
    text: "Adaptamos a linguagem, o vocabulário e o ritmo da narrativa para cada fase: 0 a 3 anos (textos curtos, rimas e muita sonoridade), 4 a 6 anos (histórias envolventes e diálogos simples) e 7 a 10 anos (narrativas mais elaboradas e vocabulário enriquecedor).",
  },
  {
    n: 6,
    title: "Envie 4 fotos",
    text: "Faça o upload de 4 fotos, de rosto e corpo inteiro, bem iluminadas da criança em diferentes ângulos e expressões. Nossa Inteligência Artificial cuida do resto para criar imagens realistas impressionantes.",
  },
  {
    n: 7,
    title: "Escreva a Dedicatória",
    text: "Torne o presente inesquecível. Digite uma mensagem de amor que será impressa logo no início das 20 páginas do livro.",
  },
  {
    n: 8,
    title: "Receba em Casa",
    text: "Nossa equipe finaliza a edição, imprime com qualidade fotográfica e envia a aventura direto para o seu endereço.",
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
