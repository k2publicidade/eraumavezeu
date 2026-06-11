import { Resend } from "resend";

/**
 * Interface abstrata de e-mail transacional — mesmo padrão de lib/whatsapp.ts.
 *
 * Sem RESEND_API_KEY (dev/test), cai no stub que só loga: nenhum envio real,
 * nenhum erro. Com a key, usa o Resend de verdade.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailClient {
  sendEmail(msg: EmailMessage): Promise<EmailResult>;
}

class StubEmailClient implements EmailClient {
  async sendEmail(msg: EmailMessage): Promise<EmailResult> {
    console.log(`[email:stub] → ${msg.to}\nAssunto: ${msg.subject}\n---`);
    return { ok: true, messageId: `stub-${Date.now()}` };
  }
}

class ResendEmailClient implements EmailClient {
  private resend: Resend;

  constructor(
    apiKey: string,
    private from: string,
  ) {
    this.resend = new Resend(apiKey);
  }

  async sendEmail(msg: EmailMessage): Promise<EmailResult> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true, messageId: data?.id };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}

let client: EmailClient | null = null;

function defaultClient(): EmailClient {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const from = process.env.EMAIL_FROM || "Era Uma Vez Eu <onboarding@resend.dev>";
    return new ResendEmailClient(apiKey, from);
  }
  return new StubEmailClient();
}

/** Permite injetar um cliente fake em testes. */
export function setEmailClient(c: EmailClient) {
  client = c;
}

/** API pública usada por toda a aplicação. */
export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  if (!client) client = defaultClient();
  return client.sendEmail(msg);
}
