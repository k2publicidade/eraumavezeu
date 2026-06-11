import { afterEach, describe, expect, it, vi } from "vitest";
import {
  EvolutionWhatsAppClient,
  initWhatsAppFromEnv,
  normalizePhone,
} from "@/lib/whatsapp-evolution";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("normalizePhone", () => {
  it("prefixa DDI 55 em número nacional com DDD (11 dígitos)", () => {
    expect(normalizePhone("(11) 99999-9999")).toBe("5511999999999");
  });

  it("prefixa DDI 55 em fixo nacional (10 dígitos)", () => {
    expect(normalizePhone("21 3333-4444")).toBe("552133334444");
  });

  it("mantém número que já tem DDI", () => {
    expect(normalizePhone("+55 11 99999-9999")).toBe("5511999999999");
  });
});

describe("EvolutionWhatsAppClient", () => {
  function mockFetch(response: Partial<Response> & { jsonBody?: unknown }) {
    const fn = vi.fn().mockResolvedValue({
      ok: response.ok ?? true,
      status: response.status ?? 200,
      json: async () => response.jsonBody ?? {},
    });
    vi.stubGlobal("fetch", fn);
    return fn;
  }

  it("envia POST para /message/sendText/{instance} com header apikey", async () => {
    const fetchMock = mockFetch({ jsonBody: { key: { id: "msg-123" } } });
    const client = new EvolutionWhatsAppClient(
      "https://evo.example.com/", // barra final deve ser normalizada
      "secret-key",
      "eraumavezeu",
    );

    const res = await client.sendMessage({
      phone: "(11) 98888-7777",
      text: "Olá!",
    });

    expect(res).toEqual({ ok: true, messageId: "msg-123" });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://evo.example.com/message/sendText/eraumavezeu");
    expect(init.headers.apikey).toBe("secret-key");
    expect(JSON.parse(init.body)).toEqual({
      number: "5511988887777",
      text: "Olá!",
    });
  });

  it("mapeia HTTP não-2xx para ok:false sem lançar", async () => {
    mockFetch({ ok: false, status: 401 });
    const client = new EvolutionWhatsAppClient("https://evo.example.com", "k", "i");
    const res = await client.sendMessage({ phone: "11999999999", text: "x" });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("401");
  });

  it("mapeia falha de rede para ok:false sem lançar", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    const client = new EvolutionWhatsAppClient("https://evo.example.com", "k", "i");
    const res = await client.sendMessage({ phone: "11999999999", text: "x" });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("ECONNREFUSED");
  });
});

describe("initWhatsAppFromEnv", () => {
  it("mantém o stub (retorna false) quando faltam env vars", () => {
    vi.stubEnv("EVOLUTION_API_URL", "");
    vi.stubEnv("EVOLUTION_API_KEY", "");
    vi.stubEnv("EVOLUTION_INSTANCE", "");
    expect(initWhatsAppFromEnv()).toBe(false);
  });
});
