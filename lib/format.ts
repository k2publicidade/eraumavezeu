/** Formatação BRL compartilhada entre UI, e-mails e mensagens WhatsApp. */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
