import { describe, it, expect, beforeEach, afterAll } from "vitest";
import type {
  WhatsAppClient,
  WhatsAppMessage,
  WhatsAppResult,
} from "@/lib/whatsapp";
import { sendMessage, setWhatsAppClient } from "@/lib/whatsapp";

/**
 * FND-06 / Pitfall #3 (Evolution API ban):
 * A lib expõe uma interface abstrata (WhatsAppClient) com um let `client`
 * injetável via setWhatsAppClient. Garantimos aqui que:
 *   (a) o stub default retorna ok:true com messageId "stub-<ts>"
 *   (b) setWhatsAppClient substitui a implementação
 *   (c) sendMessage é pass-through (não modifica msg nem result)
 *   (d) o swap Evolution → Cloud API é trocar um objeto, não refactor
 */

class RecordingClient implements WhatsAppClient {
  calls: WhatsAppMessage[] = [];
  response: WhatsAppResult;
  constructor(response: WhatsAppResult) {
    this.response = response;
  }
  async sendMessage(msg: WhatsAppMessage): Promise<WhatsAppResult> {
    this.calls.push(msg);
    return this.response;
  }
}

describe("lib/whatsapp — contrato FND-06 (interface trocável)", () => {
  /**
   * Salva um "stub-like" para restaurar ao final — evita vazamento entre arquivos.
   * (O scaffold original StubWhatsAppClient não é exportado; recriamos um equivalente.)
   */
  const originalLike: WhatsAppClient = {
    async sendMessage() {
      return { ok: true, messageId: `stub-${Date.now()}` };
    },
  };

  beforeEach(() => {
    // Cada teste seta seu próprio client explicitamente — evita dependência de ordem.
  });

  afterAll(() => {
    setWhatsAppClient(originalLike);
  });

  it("stub default retorna ok:true com messageId começando com 'stub-'", async () => {
    // Simula o comportamento do StubWhatsAppClient do scaffold.
    setWhatsAppClient(originalLike);
    const res = await sendMessage({ phone: "5521988887777", text: "oi" });
    expect(res.ok).toBe(true);
    expect(res.messageId).toMatch(/^stub-\d+$/);
  });

  it("setWhatsAppClient substitui o client e sendMessage delega", async () => {
    const fake = new RecordingClient({
      ok: true,
      messageId: "evo-abc-123",
    });
    setWhatsAppClient(fake);
    const res = await sendMessage({
      phone: "5521988887777",
      text: "Pedido aprovado",
    });
    expect(res).toEqual({ ok: true, messageId: "evo-abc-123" });
    expect(fake.calls).toHaveLength(1);
    expect(fake.calls[0]).toEqual({
      phone: "5521988887777",
      text: "Pedido aprovado",
    });
  });

  it("sendMessage repassa erros do client sem modificar", async () => {
    const fake = new RecordingClient({
      ok: false,
      error: "instance_disconnected",
    });
    setWhatsAppClient(fake);
    const res = await sendMessage({ phone: "5511999998888", text: "x" });
    expect(res).toEqual({ ok: false, error: "instance_disconnected" });
  });

  it("reinjetar novo client restaura isolamento (cada swap é limpo)", async () => {
    const first = new RecordingClient({ ok: true, messageId: "first" });
    setWhatsAppClient(first);
    await sendMessage({ phone: "21", text: "m1" });
    expect(first.calls).toHaveLength(1);

    const second = new RecordingClient({ ok: true, messageId: "second" });
    setWhatsAppClient(second);
    await sendMessage({ phone: "22", text: "m2" });
    expect(first.calls).toHaveLength(1); // não foi mexido
    expect(second.calls).toHaveLength(1);
    expect(second.calls[0].text).toBe("m2");
  });

  it("simula swap Evolution → Cloud API: trocar o objeto é suficiente", async () => {
    const evolution = new RecordingClient({ ok: true, messageId: "evo-1" });
    const cloud = new RecordingClient({ ok: true, messageId: "cloud-xyz" });

    setWhatsAppClient(evolution);
    await sendMessage({ phone: "5521", text: "via evolution" });
    expect(evolution.calls).toHaveLength(1);
    expect(cloud.calls).toHaveLength(0);

    // Swap — decisão operacional, não refactor.
    setWhatsAppClient(cloud);
    await sendMessage({ phone: "5521", text: "via cloud" });
    expect(evolution.calls).toHaveLength(1); // intocado
    expect(cloud.calls).toHaveLength(1);
    expect(cloud.calls[0].text).toBe("via cloud");
  });
});
