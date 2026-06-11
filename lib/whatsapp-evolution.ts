import {
  setWhatsAppClient,
  type WhatsAppClient,
  type WhatsAppMessage,
  type WhatsAppResult,
} from "@/lib/whatsapp";

/**
 * Normaliza para o formato que a Evolution espera: DDI 55 + DDD + número.
 * "(11) 99999-9999" vira "5511999999999". Números já com DDI passam direto.
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

/**
 * Implementação real via Evolution API v2 (POST /message/sendText/{instance}).
 * Swap futuro para WhatsApp Cloud API é só trocar esta classe — o contrato
 * WhatsAppClient está selado pelos testes da Fase 0.
 */
export class EvolutionWhatsAppClient implements WhatsAppClient {
  constructor(
    private baseUrl: string,
    private apiKey: string,
    private instance: string,
  ) {}

  async sendMessage(msg: WhatsAppMessage): Promise<WhatsAppResult> {
    const url = `${this.baseUrl.replace(/\/+$/, "")}/message/sendText/${this.instance}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.apiKey,
        },
        body: JSON.stringify({
          number: normalizePhone(msg.phone),
          text: msg.text,
        }),
      });
      if (!res.ok) {
        return { ok: false, error: `Evolution HTTP ${res.status}` };
      }
      const data = (await res.json().catch(() => null)) as
        | { key?: { id?: string } }
        | null;
      return { ok: true, messageId: data?.key?.id };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

let initialized = false;

/**
 * Ativa a Evolution quando as 3 env vars existem; sem elas mantém o stub
 * (mesmo graceful degrade do Google OAuth). Idempotente — seguro chamar
 * em module scope de quem envia mensagens.
 */
export function initWhatsAppFromEnv(): boolean {
  if (initialized) return true;
  const url = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;
  if (!url || !apiKey || !instance) return false;
  setWhatsAppClient(new EvolutionWhatsAppClient(url, apiKey, instance));
  initialized = true;
  return true;
}
