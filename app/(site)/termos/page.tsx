import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Termos de Uso e Compra",
  description:
    "Condições de uso, personalização, pagamento, produção e entrega dos livros Era Uma Vez, Eu.",
};

export default async function TermosPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <section className="border-b border-primary/10 bg-gradient-to-b from-light to-primary/5 py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
            Transparência em cada etapa
          </p>
          <h1 className="mt-4 font-serif text-4xl text-dark md:text-5xl">
            Termos de Uso e Compra
          </h1>
          <p className="mt-4 text-sm text-dark/65">
            Última atualização: 14 de julho de 2026 — Versão 1.0
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-3xl space-y-7 px-4 text-base leading-8 text-dark/80">
          <p>
            Estes termos regulam o uso do site e a compra de produtos
            personalizados da <strong>{settings.siteName}</strong>, inscrita no
            CNPJ {settings.cnpj}. Ao concluir um pedido, você confirma que leu
            estas condições e forneceu informações verdadeiras.
          </p>

          <h2 className="font-serif text-2xl text-dark">1. Personalização e conteúdo enviado</h2>
          <p>
            O comprador é responsável por conferir nomes, dedicatórias, fotos e
            demais dados enviados. Você declara ser responsável legal pela criança
            retratada ou possuir autorização legítima para usar sua imagem. Não
            envie conteúdo ofensivo, ilegal ou que viole direitos de terceiros.
          </p>

          <h2 className="font-serif text-2xl text-dark">2. Aprovação e produção</h2>
          <p>
            Quando houver etapa de prévia, a produção começa após a aprovação.
            Pequenas diferenças de cor podem ocorrer entre telas e impressão. O
            prazo exibido no pedido considera produção e transporte e pode ser
            atualizado em caso de força maior, sempre com comunicação ao cliente.
          </p>

          <h2 className="font-serif text-2xl text-dark">3. Preços e pagamento</h2>
          <p>
            Os valores, descontos, frete e prazo aplicáveis são os mostrados antes
            da confirmação. O pedido depende da aprovação do pagamento. Dados de
            cartão são processados pelo provedor de pagamento e não ficam
            armazenados diretamente por nós.
          </p>

          <h2 className="font-serif text-2xl text-dark">4. Entrega</h2>
          <p>
            O cliente deve informar um endereço completo e acompanhar as
            comunicações do pedido. Reentregas causadas por endereço incorreto,
            ausência ou recusa podem gerar novo custo de frete, informado antes da
            cobrança.
          </p>

          <h2 className="font-serif text-2xl text-dark">5. Arrependimento, cancelamento e defeitos</h2>
          <p>
            Respeitamos integralmente os direitos previstos no Código de Defesa do
            Consumidor, inclusive o prazo legal de 7 dias para arrependimento em
            compras on-line, contado conforme a legislação aplicável. Produtos com
            defeito, avaria ou divergência do pedido serão analisados e solucionados
            sem prejuízo das garantias legais. Entre em contato assim que identificar
            o problema e, quando possível, envie fotos para agilizar a avaliação.
          </p>
          <p className="rounded-2xl border border-primary/15 bg-primary/5 p-5 text-sm leading-6">
            Consulte também a orientação oficial da{" "}
            <a
              href="https://www.gov.br/mj/pt-br/assuntos/noticias/consumidor-tem-direito-ao-arrependimento-em-compras-on-line"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline decoration-gold underline-offset-4"
            >
              Secretaria Nacional do Consumidor
            </a>{" "}
            e o{" "}
            <a
              href="https://consumidor.gov.br/pages/conteudo/publico/102"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline decoration-gold underline-offset-4"
            >
              Código de Defesa do Consumidor
            </a>.
          </p>

          <h2 className="font-serif text-2xl text-dark">6. Propriedade intelectual</h2>
          <p>
            Marca, textos, ilustrações, interfaces e materiais do site não podem ser
            reproduzidos comercialmente sem autorização. A compra concede ao cliente
            o uso pessoal do produto final; não transfere direitos sobre a coleção,
            os personagens ou o projeto editorial.
          </p>

          <h2 className="font-serif text-2xl text-dark">7. Privacidade</h2>
          <p>
            O tratamento de dados pessoais e fotos está detalhado em nossa{" "}
            <Link href="/privacidade" className="font-semibold text-primary underline decoration-gold underline-offset-4">
              Política de Privacidade
            </Link>.
          </p>

          <h2 className="font-serif text-2xl text-dark">8. Atendimento e alterações</h2>
          <p>
            Podemos atualizar estes termos para refletir melhorias ou mudanças
            legais, sem reduzir direitos já adquiridos. Dúvidas, cancelamentos e
            solicitações podem ser enviados para{" "}
            <a
              href={`mailto:${settings.contactEmail}`}
              className="font-semibold text-primary underline decoration-gold underline-offset-4"
            >
              {settings.contactEmail}
            </a>.
          </p>
        </div>
      </section>
    </>
  );
}
