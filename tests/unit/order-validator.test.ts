import { describe, expect, it } from "vitest";
import {
  checkoutSchema,
  customizationSnapshotSchema,
} from "@/lib/validators/order";
import {
  AGE_RANGES,
  ART_STYLES,
  COLORS,
  GENRES,
  MAX_PHOTOS,
  THEMES,
} from "@/lib/wizard/types";

const validCustomization = {
  theme: THEMES[0].slug,
  genre: GENRES[0].slug,
  artStyle: ART_STYLES[0].slug,
  favoriteColor: COLORS[0].slug,
  ageRange: AGE_RANGES[0].slug,
  childName: "Alice",
  dedication: "Para a Alice, com amor.",
  photoKeys: ["uploadthing-key-1"],
  consentAcceptedAt: new Date().toISOString(),
  consentTextVersion: "v1",
};

const validPayload = {
  buyer: {
    name: "Mariana Souza",
    email: "mariana@email.com",
    phone: "(11) 99999-9999",
    whatsappOptIn: true,
  },
  address: {
    zipCode: "01310-100",
    street: "Avenida Paulista",
    number: "1000",
    complement: "Apto 42",
    district: "Bela Vista",
    city: "São Paulo",
    state: "sp",
  },
  items: [
    {
      slug: "livro-principal-capa-dura",
      quantity: 1,
      customization: validCustomization,
    },
  ],
};

describe("checkoutSchema", () => {
  it("aceita payload válido normalizando telefone, CEP e UF", () => {
    const parsed = checkoutSchema.parse(validPayload);
    expect(parsed.buyer.phone).toBe("11999999999");
    expect(parsed.address.zipCode).toBe("01310100");
    expect(parsed.address.state).toBe("SP");
  });

  it("rejeita e-mail inválido", () => {
    const bad = {
      ...validPayload,
      buyer: { ...validPayload.buyer, email: "nao-eh-email" },
    };
    expect(checkoutSchema.safeParse(bad).success).toBe(false);
  });

  it("rejeita telefone sem DDD (menos de 10 dígitos)", () => {
    const bad = {
      ...validPayload,
      buyer: { ...validPayload.buyer, phone: "9999-9999" },
    };
    expect(checkoutSchema.safeParse(bad).success).toBe(false);
  });

  it("rejeita CEP com tamanho errado", () => {
    const bad = {
      ...validPayload,
      address: { ...validPayload.address, zipCode: "0131" },
    };
    expect(checkoutSchema.safeParse(bad).success).toBe(false);
  });

  it("rejeita UF com mais de 2 letras", () => {
    const bad = {
      ...validPayload,
      address: { ...validPayload.address, state: "SAO" },
    };
    expect(checkoutSchema.safeParse(bad).success).toBe(false);
  });

  it("rejeita carrinho vazio", () => {
    const bad = { ...validPayload, items: [] };
    expect(checkoutSchema.safeParse(bad).success).toBe(false);
  });

  it("aceita item sem customization (adicionais não têm snapshot)", () => {
    const payload = {
      ...validPayload,
      items: [{ slug: "quebra-cabeca", quantity: 1 }],
    };
    expect(checkoutSchema.safeParse(payload).success).toBe(true);
  });
});

describe("customizationSnapshotSchema", () => {
  it("aceita snapshot válido do wizard", () => {
    expect(customizationSnapshotSchema.safeParse(validCustomization).success).toBe(true);
  });

  it("rejeita tema fora do catálogo do wizard (sem drift client/server)", () => {
    const bad = { ...validCustomization, theme: "tema-inventado" };
    expect(customizationSnapshotSchema.safeParse(bad).success).toBe(false);
  });

  it("exige ao menos 1 foto e limita a MAX_PHOTOS", () => {
    const semFoto = { ...validCustomization, photoKeys: [] };
    expect(customizationSnapshotSchema.safeParse(semFoto).success).toBe(false);

    const excesso = {
      ...validCustomization,
      photoKeys: Array.from({ length: MAX_PHOTOS + 1 }, (_, i) => `key-${i}`),
    };
    expect(customizationSnapshotSchema.safeParse(excesso).success).toBe(false);
  });

  it("rejeita consentimento sem timestamp ISO (LGPD Art. 14)", () => {
    const bad = { ...validCustomization, consentAcceptedAt: "ontem" };
    expect(customizationSnapshotSchema.safeParse(bad).success).toBe(false);
  });
});
