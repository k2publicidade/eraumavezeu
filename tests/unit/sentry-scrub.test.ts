import { describe, it, expect } from "vitest";
import { scrubPII, maskPhone } from "@/lib/sentry-scrub";

/**
 * Cobertura LGPD-05 / T-00-13/14/15:
 * - password, photos, photoKeys, cpf → removidos (drop)
 * - phone → mascarado (últimos 4 dígitos visíveis)
 * - user.ip_address → removido
 * - campos não-PII preservados
 */
describe("scrubPII (LGPD-05)", () => {
  it("remove password de request.data", () => {
    const e = {
      request: { data: { password: "segredo123", email: "a@b.com" } },
    };
    const out = scrubPII(e);
    expect((out.request!.data as Record<string, unknown>).password).toBeUndefined();
    expect((out.request!.data as Record<string, unknown>).email).toBe("a@b.com");
  });

  it("remove photos (array) de request.data", () => {
    const e = { request: { data: { photos: ["url1", "url2"] } } };
    scrubPII(e);
    expect((e.request.data as Record<string, unknown>).photos).toBeUndefined();
  });

  it("remove photoKeys (array) de request.data", () => {
    const e = { request: { data: { photoKeys: ["k1"] } } };
    scrubPII(e);
    expect((e.request.data as Record<string, unknown>).photoKeys).toBeUndefined();
  });

  it("remove cpf de request.data", () => {
    const e = { request: { data: { cpf: "12345678900" } } };
    scrubPII(e);
    expect((e.request.data as Record<string, unknown>).cpf).toBeUndefined();
  });

  it("mascara phone preservando últimos 4 dígitos", () => {
    const e = { request: { data: { phone: "5521987654321" } } };
    scrubPII(e);
    expect((e.request.data as Record<string, unknown>).phone).toBe("*********4321");
  });

  it("maskPhone com telefone curto (<=4 dígitos) não crasha", () => {
    expect(maskPhone("12")).toBe("12");
    expect(maskPhone("")).toBe("");
    expect(maskPhone("1234")).toBe("1234");
    expect(maskPhone("12345")).toBe("*2345");
  });

  it("remove user.ip_address preservando outros campos", () => {
    const e = {
      user: {
        ip_address: "189.10.20.30",
        id: "u1",
        email: "a@b.com",
      },
    };
    scrubPII(e);
    expect(e.user.ip_address).toBeUndefined();
    expect((e.user as Record<string, unknown>).id).toBe("u1");
    expect((e.user as Record<string, unknown>).email).toBe("a@b.com");
  });

  it("não crasha em evento sem request.data", () => {
    const e = { request: {} };
    expect(() => scrubPII(e)).not.toThrow();
  });

  it("não crasha em evento completamente vazio", () => {
    const e = {};
    expect(() => scrubPII(e)).not.toThrow();
  });

  it("não crasha com request.data null ou undefined", () => {
    expect(() => scrubPII({ request: { data: null as unknown as object } })).not.toThrow();
    expect(() => scrubPII({ request: { data: undefined } })).not.toThrow();
  });

  it("preserva campos não-PII (orderId, total, email)", () => {
    const e = {
      request: {
        data: {
          orderId: "cuid-abc",
          total: 249.9,
          email: "a@b.com",
          password: "rm",
        },
      },
    };
    scrubPII(e);
    expect((e.request.data as Record<string, unknown>).orderId).toBe("cuid-abc");
    expect((e.request.data as Record<string, unknown>).total).toBe(249.9);
    expect((e.request.data as Record<string, unknown>).email).toBe("a@b.com");
    expect((e.request.data as Record<string, unknown>).password).toBeUndefined();
  });
});
