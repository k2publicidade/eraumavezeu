import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perguntas Frequentes",
  description:
    "Dúvidas sobre prazos, personalização, pagamento, envio e segurança das fotos da criança.",
};

const FAQ = [
  {
    q: "Quanto tempo demora para receber o livro?",
    a: "De 10 a 12 dias úteis após a aprovação da prévia: 3-5 dias de produção + 5-7 dias de envio via Correios. Capitais tendem a chegar em até 3 dias com SEDEX.",
  },
  {
    q: "As ilustrações são feitas 100% por IA?",
    a: "Usamos IA como ferramenta, mas toda página passa por revisão humana da nossa equipe. Nada é publicado sem aprovação manual.",
  },
  {
    q: "As fotos que envio ficam públicas?",
    a: "Não. Ficam em bucket privado com URL não-listada, marca d'água em qualquer preview público e são deletadas automaticamente 90 dias após a entrega. Você pode pedir exclusão antes disso.",
  },
  {
    q: "Sou avó/padrinho, posso comprar como presente?",
    a: "Sim. O fluxo é pensado pra adultos comprarem pra crianças queridas — pais, tios, padrinhos, avós. Você preenche tudo no wizard.",
  },
  {
    q: "Quais formas de pagamento vocês aceitam?",
    a: "PIX (com desconto à vista), cartão de crédito em até 12x sem juros e boleto bancário via Mercado Pago.",
  },
  {
    q: "Posso trocar de tema depois de comprar?",
    a: "Sim, antes da aprovação da prévia. Depois que você aprovar, a produção começa e não dá mais pra alterar.",
  },
  {
    q: "Qual a faixa etária recomendada?",
    a: "De 0 a 10 anos. Oferecemos 3 faixas: 0-3 (histórias curtas, muitas imagens), 4-6 (aventuras simples), 7-10 (narrativas mais longas).",
  },
  {
    q: "O livro é impresso como?",
    a: "Capa dura, 20 páginas internas em papel couché fosco 150g, encadernação costurada. Tamanho 21x21cm.",
  },
  {
    q: "Vocês enviam pra todo o Brasil?",
    a: "Sim, para todos os CEPs atendidos pelos Correios e transportadoras parceiras da Melhor Envio.",
  },
  {
    q: "E se eu não gostar do resultado?",
    a: "Você aprova a prévia digital antes da impressão. Se não gostar, ajustamos até ficar do jeito que você quer.",
  },
  {
    q: "Qual a política de reembolso?",
    a: "Até a aprovação da prévia, reembolso integral. Após a impressão, trocas são analisadas caso a caso conforme o Código de Defesa do Consumidor.",
  },
  {
    q: "Posso acompanhar o pedido?",
    a: "Sim. Pela área do cliente você vê a timeline (pagamento, produção, envio) e o código de rastreamento quando disponível. Também recebe atualizações por e-mail e WhatsApp (opcional).",
  },
  {
    q: "Preciso criar conta pra comprar?",
    a: "Não é obrigatório — aceitamos checkout como convidado. Mas criar conta facilita acompanhar pedidos e refazer com os mesmos dados.",
  },
];

export default function FAQPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-hero-warm">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-primary">
            Perguntas Frequentes
          </h1>
          <p className="mt-4 text-lg text-dark/60">
            Não achou sua dúvida?{" "}
            <span className="text-fox font-medium">Chama no WhatsApp.</span>
          </p>
        </div>
      </section>

      <section className="py-16 bg-cream-warm">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-2">
            {FAQ.map((item, idx) => (
              <details
                key={idx}
                className="group bg-cream-light rounded-2xl border border-gold/25 overflow-hidden hover:border-gold/45 transition-colors duration-200"
              >
                <summary className="cursor-pointer px-6 py-4 font-serif text-lg text-primary flex items-center justify-between list-none gap-4 hover:bg-gold/5 transition-colors duration-200">
                  <span>{item.q}</span>
                  <span
                    className="text-gold text-2xl flex-shrink-0 group-open:rotate-45 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-dark/70 leading-relaxed border-t border-gold/15 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
