export type ShippingOption = {
  method: "PAC" | "SEDEX";
  cost: number;
  days: number;
};

/**
 * Calcula as opções de envio com base na UF (estado) do destinatário.
 * Regra do brief/MVP:
 * - Região Sudeste (SP, RJ, ES, MG): PAC grátis (R$ 0), SEDEX R$ 14.90
 * - Regiões Sul e Centro-Oeste (PR, SC, RS, DF, GO, MS, MT): PAC R$ 9.90, SEDEX R$ 22.90
 * - Outras regiões (Norte e Nordeste): PAC R$ 14.90, SEDEX R$ 29.90
 *
 * NOTA: Esta regra serve como fallback estável ou cálculo principal caso o Melhor Envio
 * não esteja configurado no ambiente.
 */
export function calculateShippingOptions(state: string): ShippingOption[] {
  const uf = state.toUpperCase().trim();
  if (!uf) return [];

  if (["SP", "RJ", "ES", "MG"].includes(uf)) {
    return [
      { method: "PAC", cost: 0, days: 5 },
      { method: "SEDEX", cost: 14.9, days: 2 },
    ];
  }

  if (["PR", "SC", "RS", "DF", "GO", "MS", "MT"].includes(uf)) {
    return [
      { method: "PAC", cost: 9.9, days: 7 },
      { method: "SEDEX", cost: 22.9, days: 3 },
    ];
  }

  return [
    { method: "PAC", cost: 14.9, days: 10 },
    { method: "SEDEX", cost: 29.9, days: 4 },
  ];
}
