export type CepAddress = {
  street: string;
  district: string;
  city: string;
  state: string;
};

/**
 * Busca endereço por CEP: ViaCEP primário, BrasilAPI como fallback
 * (ViaCEP é gratuito sem SLA — cai algumas vezes por mês).
 * Retorna null quando o CEP é inválido ou ambos os serviços falham.
 */
export async function lookupCep(cepRaw: string): Promise<CepAddress | null> {
  const cep = cepRaw.replace(/\D/g, "");
  if (cep.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (res.ok) {
      const data = (await res.json()) as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };
      if (!data.erro) {
        return {
          street: data.logradouro ?? "",
          district: data.bairro ?? "",
          city: data.localidade ?? "",
          state: data.uf ?? "",
        };
      }
      return null; // CEP inexistente — não adianta tentar o fallback
    }
  } catch {
    // ViaCEP fora do ar — cai para o BrasilAPI
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
    if (res.ok) {
      const data = (await res.json()) as {
        street?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
      };
      return {
        street: data.street ?? "",
        district: data.neighborhood ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
      };
    }
  } catch {
    // ambos falharam — usuário preenche manualmente
  }

  return null;
}
