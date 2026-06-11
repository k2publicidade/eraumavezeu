import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  purgeExpiredPhotos,
  type ExpiredCustomization,
  type PurgeDeps,
} from "@/lib/lgpd/purge-expired-photos";

function makeDeps(expired: ExpiredCustomization[]) {
  const deleted: string[][] = [];
  const cleared: string[] = [];
  const deps: PurgeDeps = {
    findExpired: async () => expired,
    deleteFiles: async (keys) => {
      deleted.push(keys);
    },
    clearPhotoKeys: async (orderId) => {
      cleared.push(orderId);
    },
  };
  return { deps, deleted, cleared };
}

describe("purgeExpiredPhotos", () => {
  it("apaga arquivos do storage e zera photoKeys de cada expirado", async () => {
    const { deps, deleted, cleared } = makeDeps([
      { orderId: "o1", photoKeys: ["k1", "k2"] },
      { orderId: "o2", photoKeys: ["k3"] },
    ]);

    const result = await purgeExpiredPhotos(deps);

    expect(result).toEqual({ purged: 2, photosDeleted: 3, failures: 0 });
    expect(deleted).toEqual([["k1", "k2"], ["k3"]]);
    expect(cleared).toEqual(["o1", "o2"]);
  });

  it("sem expirados, não toca em nada", async () => {
    const { deps, deleted, cleared } = makeDeps([]);
    const result = await purgeExpiredPhotos(deps);
    expect(result).toEqual({ purged: 0, photosDeleted: 0, failures: 0 });
    expect(deleted).toHaveLength(0);
    expect(cleared).toHaveLength(0);
  });

  it("falha em um pedido não interrompe os demais (retry no próximo cron)", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { deps, cleared } = makeDeps([
      { orderId: "o1", photoKeys: ["k1"] },
      { orderId: "o2", photoKeys: ["k2"] },
      { orderId: "o3", photoKeys: ["k3"] },
    ]);
    const original = deps.deleteFiles;
    deps.deleteFiles = async (keys) => {
      if (keys.includes("k2")) throw new Error("storage indisponível");
      return original(keys);
    };

    const result = await purgeExpiredPhotos(deps);

    expect(result.purged).toBe(2);
    expect(result.failures).toBe(1);
    // o que falhou NÃO teve photoKeys zeradas — será tentado de novo
    expect(cleared).toEqual(["o1", "o3"]);
    expect(errorSpy).toHaveBeenCalledOnce();
    errorSpy.mockRestore();
  });

  it("não chama deleteFiles para customization sem fotos, mas zera as keys", async () => {
    const { deps, deleted, cleared } = makeDeps([
      { orderId: "o1", photoKeys: [] },
    ]);
    const result = await purgeExpiredPhotos(deps);
    expect(deleted).toHaveLength(0);
    expect(cleared).toEqual(["o1"]);
    expect(result.purged).toBe(1);
  });
});
