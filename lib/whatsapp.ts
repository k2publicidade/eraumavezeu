/**
 * Interface abstrata de mensageria WhatsApp.
 *
 * MOTIVAÇÃO: Evolution API (Baileys) tem risco de ban (2-8 semanas em prod BR).
 * Essa camada permite swap Evolution → WhatsApp Cloud API oficial sem refactor
 * — basta trocar a implementação concreta.
 *
 * Implementação real da Evolution chega na Fase 5 (COMM-03).
 * Na Fase 0, ficamos só com o stub + log.
 */

export interface WhatsAppMessage {
  phone: string; // E.164-ish: "5521999999999" ou "21999999999" (normalizamos)
  text: string;
}

export interface WhatsAppResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

export interface WhatsAppClient {
  sendMessage(msg: WhatsAppMessage): Promise<WhatsAppResult>;
}

/**
 * Stub usado em dev/test e na Fase 0 antes da Fase 5 implementar Evolution.
 * Loga e "finge sucesso" — sem efeito colateral.
 */
class StubWhatsAppClient implements WhatsAppClient {
  async sendMessage(msg: WhatsAppMessage): Promise<WhatsAppResult> {
    console.log(
      `[whatsapp:stub] → ${msg.phone}\n${msg.text}\n---`
    );
    return { ok: true, messageId: `stub-${Date.now()}` };
  }
}

let client: WhatsAppClient = new StubWhatsAppClient();

/**
 * Permite injetar um cliente real (Evolution, WhatsApp Cloud, mock de teste).
 * Chamado em lib/whatsapp/init.ts na Fase 5.
 */
export function setWhatsAppClient(c: WhatsAppClient) {
  client = c;
}

/**
 * API pública usada por toda a aplicação. Sempre passa pelo cliente atual.
 */
export async function sendMessage(
  msg: WhatsAppMessage
): Promise<WhatsAppResult> {
  return client.sendMessage(msg);
}
