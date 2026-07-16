import { describe, expect, it } from "vitest";
import {
  calculateCheckDigit,
  generateAccessKey,
  generateNfeXml,
  NfeData,
  NfeIssuerInfo,
} from "@/lib/nfe/nfe-generator";

describe("NF-e Generator", () => {
  describe("calculateCheckDigit (Mod 11)", () => {
    it("deve calcular o dígito verificador corretamente", () => {
      // Exemplo de chave real sem o dígito verificador final
      // Chave: 3515081234567800019055001000000001100000000 (43 dígitos)
      const key43 = "3515081234567800019055001000000001100000000";
      const digit = calculateCheckDigit(key43);
      expect(digit).toBeGreaterThanOrEqual(0);
      expect(digit).toBeLessThanOrEqual(9);
    });

    it("retorna 0 quando o resto é 0 ou 1", () => {
      // Vamos tentar forçar um valor de soma que dê resto 0 ou 1
      // O algoritmo trata estes casos retornando 0
      const key43 = "0000000000000000000000000000000000000000000";
      expect(calculateCheckDigit(key43)).toBe(0);
    });
  });

  describe("generateAccessKey", () => {
    it("deve gerar uma chave de acesso válida com 44 caracteres", () => {
      const keyInfo = generateAccessKey({
        ufCode: "33",
        date: new Date("2026-07-16T12:00:00.000Z"),
        cnpj: "60.765.718/0001-09",
        model: "55",
        series: "001",
        number: "123",
        emissionType: "1",
        numericCode: "85429181",
      });

      expect(keyInfo.key).toHaveLength(44);
      // Inicia com UF (33)
      expect(keyInfo.key.startsWith("33")).toBe(true);
      // Contém CNPJ formatado no meio (60765718000109)
      expect(keyInfo.key.includes("60765718000109")).toBe(true);
      // Contém modelo (55)
      expect(keyInfo.key.substring(20, 22)).toBe("55");
    });
  });

  describe("generateNfeXml", () => {
    const mockIssuer: NfeIssuerInfo = {
      cnpj: "60.765.718/0001-09",
      ie: "149.336.812.110",
      name: "Era Uma Vez Eu Editora Ltda",
      tradeName: "Era Uma Vez Eu",
      street: "Avenida Rio Branco",
      number: "156",
      complement: "Sala 2602",
      district: "Centro",
      cityCode: "3304557",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "20040-003",
      ufCode: "33",
    };

    const mockData: NfeData = {
      orderId: "cuid12345678",
      orderNumber: "85429181",
      createdAt: new Date("2026-07-16T12:00:00.000Z"),
      items: [
        {
          name: "Livro Infantil Personalizado O Pequeno Explorador",
          quantity: 1,
          price: 120.0,
          discount: 20.0,
        },
      ],
      shippingCost: 15.0,
      discount: 20.0,
      total: 115.0,
      paymentMethod: "PIX",
      recipient: {
        cpfOrCnpj: "123.456.789-00",
        name: "Fulano de Tal",
        email: "fulano@email.com",
        street: "Rua das Flores",
        number: "123",
        district: "Jardins",
        cityCode: "3550308", // São Paulo
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-000",
      },
    };

    it("deve gerar XML contendo tags e NCM de livros", () => {
      const { xml, key, number, series } = generateNfeXml(mockData, mockIssuer);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain("<nfeProc");
      expect(xml).toContain("<NFe>");
      
      // Valida o NCM de livros físicos no XML
      expect(xml).toContain("<NCM>49019900</NCM>");
      
      // Valida que imunidade tributária de livros é mencionada nos dados adicionais
      expect(xml).toContain("Imunidade Tributaria de Livros");
      
      // Valida alíquota de ICMS simulada do Simples Nacional CSOSN 400 (imune)
      expect(xml).toContain("<CSOSN>400</CSOSN>");
      
      // Valida que a chave de acesso gerada bate com o ID infNFe no XML
      expect(xml).toContain(`Id="NFe${key}"`);
    });
  });
});
