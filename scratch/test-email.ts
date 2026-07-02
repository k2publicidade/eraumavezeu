import { sendEmail } from "../lib/email";
import dotenv from "dotenv";
import path from "path";

// Carrega as variáveis do .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
  
  console.log("\n=== TESTE DE ENVIO RESEND ===");
  console.log("API Key carregada:", apiKey ? `${apiKey.substring(0, 7)}...` : "NÃO ENCONTRADA");
  console.log("Remetente (From):", fromEmail);
  console.log("Destinatário (To):", "atendimento@eraumavezeu.com.br");
  console.log("==============================\n");

  if (!apiKey) {
    console.error("Erro: RESEND_API_KEY não foi encontrada no .env.local.");
    process.exit(1);
  }

  // Se você ainda não verificou o domínio eraumavezeu.com.br no painel do Resend,
  // remetentes que não sejam 'onboarding@resend.dev' podem falhar.
  console.log("Disparando e-mail de teste...");
  const res = await sendEmail({
    to: "atendimento@eraumavezeu.com.br",
    subject: "Teste de Integração Resend 🚀",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #E8C94A; border-radius: 8px; background-color: #FFFDF5;">
        <h2 style="color: #1E3A5F; border-bottom: 2px solid #E8C94A; padding-bottom: 10px;">Integração Resend Configurada! 🎉</h2>
        <p>Olá equipe <strong>Era Uma Vez Eu</strong>,</p>
        <p>Este é um e-mail de teste disparado via script local para validar a chave de API do Resend.</p>
        <p>Se você recebeu esta mensagem na sua caixa de entrada:</p>
        <ol>
          <li>A chave de API <code>${apiKey.substring(0, 10)}...</code> está ativa e válida.</li>
          <li>As configurações de envio no seu ambiente estão corretas.</li>
        </ol>
        <hr style="border: 0; border-top: 1px solid #E8C94A; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Enviado de: <strong>${fromEmail}</strong></p>
      </div>
    `,
  });

  if (res.ok) {
    console.log("\n✅ SUCESSO: E-mail enviado com sucesso!");
    console.log("Message ID:", res.messageId);
    console.log("\nVerifique a caixa de entrada (ou caixa de spam/lixo eletrônico) do e-mail atendimento@eraumavezeu.com.br.");
  } else {
    console.error("\n❌ ERRO ao enviar e-mail:", res.error);
    console.log("\nDicas para correção:");
    console.log("1. Se o erro mencionar 'sender not verified', você precisa configurar/verificar o domínio 'eraumavezeu.com.br' no painel do Resend.");
    console.log("2. Em contas novas/sandbox do Resend (sem domínio verificado), você só pode enviar de 'onboarding@resend.dev' e para o e-mail da sua própria conta Resend.");
  }
}

run();
