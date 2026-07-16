import { describe, expect, it, vi } from "vitest";
import DanfePage from "@/app/admin/pedidos/[id]/danfe/page";
import EtiquetaPage from "@/app/admin/pedidos/[id]/etiqueta/page";
import { db } from "@/lib/db";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND_TRIGGERED");
  }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    order: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/site-content", () => ({
  getSiteSettings: vi.fn(async () => ({
    siteName: "Era Uma Vez Eu",
    siteTagline: "Tagline",
    cnpj: "00000",
    contactEmail: "a@a.com",
    whatsappNumber: "00000",
    whatsappDisplay: "000",
    whatsappMessageDefault: "oi",
    instagramLabel: "insta",
    instagramHref: "https://insta",
    tiktokLabel: "tiktok",
    tiktokHref: "https://tiktok",
  })),
}));

const MOCK_ORDER = {
  id: "order-123",
  nfeStatus: "EMITIDA",
  nfeNumber: "000001",
  nfeSeries: "1",
  nfeKey: "33260760765718000109550010009332161909519530",
  nfeXml: "<xml></xml>",
  nfeIssuedAt: new Date("2026-07-16T01:58:11.101Z"),
  guestName: "CASSIO PORFIRIO",
  guestCpf: "13991249782",
  guestPhone: "21971625971",
  total: 249.9,
  discount: 0,
  couponDiscount: 0,
  shippingCost: 15.0,
  shippingMethod: "SEDEX",
  trackingCode: "QH123456789BR",
  items: [
    {
      id: "item-1",
      quantity: 1,
      price: 249.9,
      product: {
        id: "prod-1",
        name: "Livro Capa Dura",
      },
    },
  ],
  shippingAddress: {
    id: "addr-1",
    name: "CASSIO PORFIRIO",
    street: "Rua Samuel Das neves",
    number: "415",
    complement: null,
    district: "PECHINCHA",
    city: "Rio de Janeiro",
    state: "RJ",
    zipCode: "22710110",
  },
};

describe("DanfePage", () => {
  it("renders danfe page without throwing", async () => {
    vi.mocked(db.order.findUnique).mockResolvedValueOnce(MOCK_ORDER as any);
    const res = await DanfePage({ params: { id: "order-123" } });
    expect(res).toBeDefined();
  });

  it("triggers not found when nfeStatus is not EMITIDA", async () => {
    vi.mocked(db.order.findUnique).mockResolvedValueOnce({
      ...MOCK_ORDER,
      nfeStatus: "PENDENTE",
    } as any);
    await expect(DanfePage({ params: { id: "order-123" } })).rejects.toThrow("NOT_FOUND_TRIGGERED");
  });
});

describe("EtiquetaPage", () => {
  it("renders etiqueta page without throwing", async () => {
    vi.mocked(db.order.findUnique).mockResolvedValueOnce(MOCK_ORDER as any);
    const res = await EtiquetaPage({ params: { id: "order-123" } });
    expect(res).toBeDefined();
  });
});
