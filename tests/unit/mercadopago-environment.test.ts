import { describe, expect, it } from "vitest";
import {
  assertMercadoPagoEnvironment,
  assertMercadoPagoLiveMode,
  MercadoPagoProductionConfigurationError,
  selectMercadoPagoCheckoutUrl,
} from "@/lib/payments/mercadopago-environment";

const production = { NODE_ENV: "production", MP_ENVIRONMENT: "production" } as const;
const development = { NODE_ENV: "development", MP_ENVIRONMENT: "test" } as const;

describe("Mercado Pago production guard", () => {
  it("rejects an explicitly non-production environment", () => {
    expect(() =>
      assertMercadoPagoEnvironment({ NODE_ENV: "production", MP_ENVIRONMENT: "test" }),
    ).toThrow(MercadoPagoProductionConfigurationError);
  });

  it("rejects payments that the API does not mark as live", () => {
    expect(() => assertMercadoPagoLiveMode(false, production)).toThrow(
      MercadoPagoProductionConfigurationError,
    );
    expect(() => assertMercadoPagoLiveMode(undefined, production)).toThrow(
      MercadoPagoProductionConfigurationError,
    );
  });

  it("accepts a live payment in production", () => {
    expect(() => assertMercadoPagoLiveMode(true, production)).not.toThrow();
  });

  it("always chooses init_point in production", () => {
    expect(
      selectMercadoPagoCheckoutUrl(
        {
          initPoint: "https://www.mercadopago.com.br/checkout/v1/redirect",
          sandboxInitPoint: "https://sandbox.mercadopago.com.br/checkout/v1/redirect",
        },
        production,
      ),
    ).toBe("https://www.mercadopago.com.br/checkout/v1/redirect");
  });

  it("rejects a sandbox URL in production", () => {
    expect(() =>
      selectMercadoPagoCheckoutUrl(
        { initPoint: "https://sandbox.mercadopago.com.br/checkout" },
        production,
      ),
    ).toThrow(MercadoPagoProductionConfigurationError);
  });

  it("prefers sandbox_init_point outside production", () => {
    expect(
      selectMercadoPagoCheckoutUrl(
        {
          initPoint: "https://www.mercadopago.com.br/checkout",
          sandboxInitPoint: "https://sandbox.mercadopago.com.br/checkout",
        },
        development,
      ),
    ).toBe("https://sandbox.mercadopago.com.br/checkout");
  });
});
