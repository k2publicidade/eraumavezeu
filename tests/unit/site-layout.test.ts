import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  NAV_ITEMS,
  SITE_NAME,
  WHATSAPP_NUMBER,
  WHATSAPP_MESSAGE_DEFAULT,
} from "@/lib/site-config";

const repoRoot = path.resolve(__dirname, "../..");

describe("site-config", () => {
  it("NAV_ITEMS contains the 7 expected public routes in order", () => {
    expect(NAV_ITEMS).toHaveLength(7);
    expect(NAV_ITEMS.map((n) => n.href)).toEqual([
      "/",
      "/como-funciona",
      "/produtos",
      "/para-todas-ocasioes",
      "/galeria",
      "/faq",
      "/contato",
    ]);
  });

  it("SITE_NAME is 'Era Uma Vez Eu'", () => {
    expect(SITE_NAME).toBe("Era Uma Vez Eu");
  });

  it("WHATSAPP_NUMBER is a 13-digit BR number starting with 55", () => {
    expect(WHATSAPP_NUMBER).toMatch(/^55\d{11}$/);
    expect(WHATSAPP_NUMBER).toHaveLength(13);
  });
});

describe("WhatsAppFloatingButton config", () => {
  it("builds a wa.me URL with encoded default message", () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      WHATSAPP_MESSAGE_DEFAULT,
    )}`;
    expect(url).toContain(`wa.me/${WHATSAPP_NUMBER}`);
    expect(url).toContain("text=");
    expect(url).toContain(encodeURIComponent("livro personalizado"));
  });
});

describe("Footer component source", () => {
  it("imports brand name from site-config and links to privacy policy", () => {
    const footer = readFileSync(
      path.join(repoRoot, "components/site/Footer.tsx"),
      "utf8",
    );
    expect(footer).toMatch(/SITE_NAME/);
    expect(footer).toContain("Política de Privacidade");
    expect(footer).toContain("/privacidade");
  });
});
