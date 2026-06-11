import { describe, expect, it } from "vitest";
import {
  ORDER_STATUSES,
  PHOTO_RETENTION_DAYS,
  STATUS_LABELS,
  photosExpireAtFrom,
  statusLabelOf,
} from "@/lib/orders/status";

describe("STATUS_LABELS", () => {
  it("cobre todos os status do enum (sem status sem label)", () => {
    for (const status of ORDER_STATUSES) {
      expect(STATUS_LABELS[status]).toBeTruthy();
    }
    expect(Object.keys(STATUS_LABELS)).toHaveLength(ORDER_STATUSES.length);
  });

  it("statusLabelOf cai no valor cru para status desconhecido", () => {
    expect(statusLabelOf("ENVIADO")).toBe("Enviado");
    expect(statusLabelOf("STATUS_NOVO")).toBe("STATUS_NOVO");
  });
});

describe("photosExpireAtFrom (retenção LGPD)", () => {
  it("expira exatamente PHOTO_RETENTION_DAYS após a entrega", () => {
    const delivered = new Date("2026-06-11T12:00:00.000Z");
    const expires = photosExpireAtFrom(delivered);
    const diffDays =
      (expires.getTime() - delivered.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(PHOTO_RETENTION_DAYS);
    expect(PHOTO_RETENTION_DAYS).toBe(90);
  });

  it("não muta a data de entrega original", () => {
    const delivered = new Date("2026-06-11T12:00:00.000Z");
    photosExpireAtFrom(delivered);
    expect(delivered.toISOString()).toBe("2026-06-11T12:00:00.000Z");
  });
});
