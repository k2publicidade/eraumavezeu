export class MercadoPagoProductionConfigurationError extends Error {
  readonly code = "MERCADOPAGO_PRODUCTION_CONFIGURATION_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "MercadoPagoProductionConfigurationError";
  }
}

type RuntimeEnvironment = {
  NODE_ENV?: "development" | "production" | "test";
  MP_ENVIRONMENT?: string;
};

function isProductionRuntime(environment: RuntimeEnvironment): boolean {
  return environment.NODE_ENV === "production";
}

export function assertMercadoPagoEnvironment(
  environment: RuntimeEnvironment = process.env,
): void {
  if (!isProductionRuntime(environment)) return;

  const configuredMode = environment.MP_ENVIRONMENT?.trim().toLowerCase();
  if (configuredMode && configuredMode !== "production") {
    throw new MercadoPagoProductionConfigurationError(
      "Mercado Pago is not configured for production",
    );
  }
}

// Checkout Pro test and production tokens can share the APP_USR prefix.
// The live_mode field returned by the API is the authoritative signal.
export function assertMercadoPagoLiveMode(
  liveMode: boolean | undefined,
  environment: RuntimeEnvironment = process.env,
): void {
  if (isProductionRuntime(environment) && liveMode !== true) {
    throw new MercadoPagoProductionConfigurationError(
      "Mercado Pago API returned a non-production payment",
    );
  }
}

type CheckoutPoints = {
  initPoint?: string;
  sandboxInitPoint?: string;
};

export function selectMercadoPagoCheckoutUrl(
  points: CheckoutPoints,
  environment: RuntimeEnvironment = process.env,
): string {
  if (!isProductionRuntime(environment)) {
    const developmentUrl = points.sandboxInitPoint || points.initPoint;
    if (!developmentUrl) {
      throw new Error("Mercado Pago did not return a checkout URL");
    }
    return developmentUrl;
  }

  if (!points.initPoint || /(^|[./-])sandbox([./-]|$)/i.test(points.initPoint)) {
    throw new MercadoPagoProductionConfigurationError(
      "Mercado Pago did not return a production checkout URL",
    );
  }

  return points.initPoint;
}
