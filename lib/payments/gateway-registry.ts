import type { PaymentGateway } from "./types";
import { MercadoPagoGateway } from "./mercadopago";
import { SimulatedGateway } from "./simulado";

const gateways: Record<string, PaymentGateway> = {
  MERCADOPAGO: new MercadoPagoGateway(),
  SIMULADO: new SimulatedGateway(),
};

/**
 * Retorna a instância do gateway de pagamento correspondente.
 * Lança um erro se o gateway não for suportado.
 */
export function getPaymentGateway(gatewayName: string): PaymentGateway {
  const name = gatewayName.toUpperCase();
  const gateway = gateways[name];
  if (!gateway) {
    throw new Error(`Gateway de pagamento não suportado: ${gatewayName}`);
  }
  return gateway;
}

/**
 * Retorna todos os gateways de pagamento registrados.
 */
export function getAllGateways(): PaymentGateway[] {
  return Object.values(gateways);
}
