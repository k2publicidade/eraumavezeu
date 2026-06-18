import { describe, expect, it } from "vitest";
import {
  DEFAULT_FAQ_ITEMS,
  DEFAULT_SITE_SETTINGS,
  buildWhatsappHref,
  resolveFaqItems,
  resolveSiteSettings,
} from "@/lib/site-content";

describe("site content settings", () => {
  it("uses safe defaults when no database records exist", () => {
    const settings = resolveSiteSettings([]);

    expect(settings.siteName).toBe(DEFAULT_SITE_SETTINGS.siteName);
    expect(settings.contactEmail).toBe(DEFAULT_SITE_SETTINGS.contactEmail);
    expect(settings.whatsappNumber).toMatch(/^55\d{11}$/);
  });

  it("applies database overrides without losing missing defaults", () => {
    const settings = resolveSiteSettings([
      { key: "contactEmail", value: "novo@eraumavezeu.com.br" },
      { key: "whatsappDisplay", value: "(11) 90000-0000" },
    ]);

    expect(settings.contactEmail).toBe("novo@eraumavezeu.com.br");
    expect(settings.whatsappDisplay).toBe("(11) 90000-0000");
    expect(settings.siteName).toBe(DEFAULT_SITE_SETTINGS.siteName);
  });

  it("builds WhatsApp URLs with encoded default message", () => {
    const href = buildWhatsappHref({
      ...DEFAULT_SITE_SETTINGS,
      whatsappNumber: "5511999999999",
      whatsappMessageDefault: "Olá! Quero um livro personalizado.",
    });

    expect(href).toContain("https://wa.me/5511999999999");
    expect(href).toContain("text=Ol%C3%A1!");
    expect(href).toContain("livro%20personalizado");
  });
});

describe("FAQ content", () => {
  it("uses default FAQ items when database returns none", () => {
    expect(resolveFaqItems([])).toEqual(DEFAULT_FAQ_ITEMS);
  });

  it("sorts active FAQ items and hides inactive entries", () => {
    const items = resolveFaqItems([
      {
        id: "second",
        question: "Segunda pergunta?",
        answer: "Segunda resposta.",
        sortOrder: 20,
        active: true,
      },
      {
        id: "hidden",
        question: "Pergunta oculta?",
        answer: "Resposta oculta.",
        sortOrder: 1,
        active: false,
      },
      {
        id: "first",
        question: "Primeira pergunta?",
        answer: "Primeira resposta.",
        sortOrder: 10,
        active: true,
      },
    ]);

    expect(items.map((item) => item.id)).toEqual(["first", "second"]);
  });
});
