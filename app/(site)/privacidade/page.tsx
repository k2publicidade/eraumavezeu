import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como tratamos dados pessoais, incluindo fotos de crianças, em conformidade com a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-to-b from-light to-primary/5">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl text-dark">
            Política de Privacidade
          </h1>
          <p className="mt-4 text-sm text-dark/60">
            Última atualização: 2026-04-20 — Versão 1.0
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl prose prose-dark text-dark/80 space-y-6">
          <p>
            O <strong>Era Uma Vez Eu</strong> respeita sua privacidade e opera
            em conformidade com a <strong>LGPD (Lei 13.709/18)</strong>,
            incluindo o Art. 14 (tratamento de dados pessoais de crianças e
            adolescentes).
          </p>

          <h2 className="font-serif text-2xl text-dark mt-8">
            1. Dados que coletamos
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Dados do adulto comprador: nome, e-mail, telefone, CPF, endereço.
            </li>
            <li>
              Dados da criança para personalização: nome, idade, faixa etária.
            </li>
            <li>
              Fotos da criança (até 4) para referência das ilustrações — dado
              sensível.
            </li>
            <li>
              Dados de pagamento: processados diretamente pelo Mercado Pago, não
              armazenamos número de cartão.
            </li>
          </ul>

          <h2 className="font-serif text-2xl text-dark mt-8">
            2. Consentimento especial (LGPD Art. 14)
          </h2>
          <p>
            Fotos de crianças só são enviadas após o <strong>aceite
            explícito</strong> do pai, mãe ou responsável legal, em checkbox
            não-ticado por padrão. Registramos IP, timestamp e versão do texto
            aceito como prova do consentimento.
          </p>

          <h2 className="font-serif text-2xl text-dark mt-8">
            3. Como protegemos as fotos
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Armazenamento em bucket privado, não-listado publicamente.</li>
            <li>
              Acesso via URL assinada com expiração de 15 minutos — links nunca
              são permanentes.
            </li>
            <li>
              <strong>Marca d&apos;água</strong> obrigatória em qualquer preview
              público.
            </li>
            <li>
              Retenção máxima de <strong>90 dias</strong> após o status{" "}
              <em>ENTREGUE</em>. Após isso, deletadas por cron automático.
            </li>
            <li>
              Você pode solicitar exclusão antes desse prazo pela área do
              cliente ou contato direto.
            </li>
          </ul>

          <h2 className="font-serif text-2xl text-dark mt-8">
            4. Seus direitos (LGPD Art. 18)
          </h2>
          <p>Você pode a qualquer momento:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Confirmar se tratamos seus dados e acessá-los.</li>
            <li>Corrigir dados incompletos ou desatualizados.</li>
            <li>Solicitar anonimização, bloqueio ou exclusão.</li>
            <li>Portar seus dados para outro fornecedor.</li>
            <li>Revogar o consentimento a qualquer tempo.</li>
          </ul>

          <h2 className="font-serif text-2xl text-dark mt-8">
            5. DPO (Encarregado de Dados)
          </h2>
          <p>
            Para exercer seus direitos ou tirar dúvidas sobre tratamento de
            dados, entre em contato com o DPO pelo e-mail:{" "}
            <a
              href="mailto:dpo@eraumavezeu.com.br"
              className="text-primary hover:text-primary-dark underline"
            >
              dpo@eraumavezeu.com.br
            </a>
          </p>

          <h2 className="font-serif text-2xl text-dark mt-8">
            6. Cookies
          </h2>
          <p>
            Usamos cookies essenciais (sessão, carrinho) e de analytics
            agregado (Vercel Analytics) para entender uso do site. Não usamos
            cookies de publicidade.
          </p>

          <h2 className="font-serif text-2xl text-dark mt-8">
            7. Compartilhamento
          </h2>
          <p>
            Compartilhamos dados apenas com processadores essenciais ao serviço:
            Mercado Pago (pagamento), Melhor Envio (frete), Resend (e-mail
            transacional), Uploadthing (armazenamento de fotos com criptografia
            em repouso) e Supabase (banco de dados). Todos com acordos de
            processamento de dados.
          </p>

          <h2 className="font-serif text-2xl text-dark mt-8">
            8. Alterações
          </h2>
          <p>
            Esta política pode ser atualizada. Mudanças relevantes serão
            comunicadas por e-mail e nesta página.
          </p>
        </div>
      </section>
    </>
  );
}
