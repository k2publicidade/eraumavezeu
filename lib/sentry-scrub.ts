/**
 * Remove PII LGPD-sensível de eventos antes de enviar ao Sentry.
 *
 * Compartilhado entre sentry.server/client/edge.config.ts — os 3 configs
 * delegam para essa função pura em beforeSend. Edge-safe: sem Node built-ins,
 * sem dependências externas — apenas regex/plain JS.
 *
 * LGPD-05 (T-00-13/14/15):
 * - Campos removidos por completo de request.data: password, photos, photoKeys, cpf
 * - Campo mascarado em request.data: phone (mantém só os últimos 4 dígitos)
 * - Campo removido de event.user: ip_address
 */

export type ScrubableEvent = {
  request?: { data?: unknown };
  user?: ({ ip_address?: string | null } & Record<string, unknown>) | null;
  [k: string]: unknown;
};

const PII_KEYS_TO_DROP = ["password", "photos", "photoKeys", "cpf"] as const;

/**
 * Remove PII do evento in-place e retorna o mesmo evento.
 *
 * Seguro contra:
 * - evento undefined/null
 * - request ausente
 * - request.data null/undefined/não-objeto
 * - user ausente/null
 */
export function scrubPII<E extends ScrubableEvent>(event: E): E {
  if (!event) return event;

  if (
    event.request &&
    event.request.data &&
    typeof event.request.data === "object"
  ) {
    const data = event.request.data as Record<string, unknown>;
    for (const key of PII_KEYS_TO_DROP) {
      if (key in data) delete data[key];
    }
    if (typeof data.phone === "string") {
      data.phone = maskPhone(data.phone);
    }
  }

  if (event.user) {
    delete event.user.ip_address;
  }

  return event;
}

/**
 * Mascara telefone preservando só os últimos 4 dígitos.
 * Ex: "5521987654321" → "*********4321"
 * Ex: "1234"          → "1234"   (regex não altera quando len ≤ 4)
 * Ex: ""              → ""
 */
export function maskPhone(phone: string): string {
  // /\d(?=\d{4})/g substitui todo dígito que tenha pelo menos 4 dígitos depois dele.
  return phone.replace(/\d(?=\d{4})/g, "*");
}
