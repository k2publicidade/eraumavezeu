import { describe, expect, it } from "vitest";
import type { OrderWithDetails } from "@/lib/payments/types";
import {
  buildMercadoPagoPaymentBody,
  mapMercadoPagoPaymentState,
  paymentIdempotencyKey,
  transparentPaymentInputSchema,
  type TransparentPaymentInput,
} from "@/lib/payments/mercadopago-transparent";

const order = {
  id: "cm1234567890123456789012",
  total: 249.9,
  shippingCost: 14.9,
  shippingMethod: "SEDEX",
  guestName: "Cassio Silva",
  guestEmail: "cliente@example.com",
  guestCpf: "529.982.247-25",
  items: [{
    productId: "product-1",
    product: { name: "Livro Capa Dura" },
    quantity: 1,
    price: 235,
  }],
  shippingAddress: {
    zipCode: "01310100",
    street: "Avenida Paulista",
    number: "1000",
    district: "Bela Vista",
    city: "São Paulo",
    state: "SP",
  },
} as unknown as OrderWithDetails;

const pixInput: TransparentPaymentInput = {
  selectedPaymentMethod: "bank_transfer",
  formData: {
    payment_method_id: "pix",
    transaction_amount: 1,
  },
};

const cardInput: TransparentPaymentInput = {
  selectedPaymentMethod: "creditCard",
  formData: {
    payment_method_id: "visa",
    token: "card-token-generated-by-mercado-pago",
    issuer_id: "310",
    installments: 3,
    transaction_amount: 1,
  },
};

describe("checkout transparente Mercado Pago", () => {
  it("aceita apenas os meios de pagamento habilitados", () => {
    expect(transparentPaymentInputSchema.safeParse(pixInput).success).toBe(true);
    expect(transparentPaymentInputSchema.safeParse({
      selectedPaymentMethod: "ticket",
      formData: { payment_method_id: "bolbradesco" },
    }).success).toBe(false);
  });

  it("usa total e pagador do banco, ignorando valores manipulados no navegador", () => {
    const body = buildMercadoPagoPaymentBody(order, pixInput);

    expect(body.transaction_amount).toBe(249.9);
    expect(body.external_reference).toBe(order.id);
    expect(body.payer?.email).toBe("cliente@example.com");
    expect(body.payer?.identification).toEqual({ type: "CPF", number: "52998224725" });
    expect(body.payment_method_id).toBe("pix");
    expect(body.token).toBeUndefined();
  });

  it("envia somente o token do cartão e respeita o parcelamento validado", () => {
    const body = buildMercadoPagoPaymentBody(order, cardInput);

    expect(body.token).toBe(cardInput.formData.token);
    expect(body.installments).toBe(3);
    expect(body.issuer_id).toBe(310);
    expect(body.transaction_amount).toBe(249.9);
  });

  it("rejeita cartão sem token seguro", () => {
    expect(() => buildMercadoPagoPaymentBody(order, {
      selectedPaymentMethod: "creditCard",
      formData: { payment_method_id: "visa", installments: 1 },
    })).toThrow("INVALID_CARD_TOKEN");
  });

  it("mantém PIX idempotente e permite nova tentativa com outro token de cartão", () => {
    expect(paymentIdempotencyKey(order.id, pixInput)).toBe(
      paymentIdempotencyKey(order.id, pixInput),
    );
    expect(paymentIdempotencyKey(order.id, cardInput)).not.toBe(
      paymentIdempotencyKey(order.id, {
        ...cardInput,
        formData: { ...cardInput.formData, token: "another-secure-card-token" },
      }),
    );
  });

  it("mapeia estados do gateway para pedido e pagamento", () => {
    expect(mapMercadoPagoPaymentState("approved")).toEqual({
      paymentStatus: "APROVADO",
      orderStatus: "PAGAMENTO_CONFIRMADO",
    });
    expect(mapMercadoPagoPaymentState("rejected")).toEqual({
      paymentStatus: "REJEITADO",
      orderStatus: "AGUARDANDO_PAGAMENTO",
    });
    expect(mapMercadoPagoPaymentState("pending").paymentStatus).toBe("PENDENTE");
  });
});
