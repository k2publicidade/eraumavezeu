/**
 * Fonte única de verdade sobre status de pedido fora do Prisma.
 * Mantém labels PT-BR e regras derivadas (retenção LGPD) num lugar só.
 */

export const ORDER_STATUSES = [
  "AGUARDANDO_PAGAMENTO",
  "PAGAMENTO_CONFIRMADO",
  "EM_PRODUCAO",
  "AGUARDANDO_ENVIO",
  "ENVIADO",
  "ENTREGUE",
  "CANCELADO",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatusValue, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  PAGAMENTO_CONFIRMADO: "Pagamento confirmado",
  EM_PRODUCAO: "Em produção",
  AGUARDANDO_ENVIO: "Aguardando envio",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export function statusLabelOf(status: string): string {
  return STATUS_LABELS[status as OrderStatusValue] ?? status;
}

/** Dias que as fotos ficam retidas após a entrega (LGPD — política do termo). */
export const PHOTO_RETENTION_DAYS = 90;

/** Data-limite de retenção das fotos a partir da entrega confirmada. */
export function photosExpireAtFrom(deliveredAt: Date): Date {
  const expires = new Date(deliveredAt);
  expires.setDate(expires.getDate() + PHOTO_RETENTION_DAYS);
  return expires;
}
