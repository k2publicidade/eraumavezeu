"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/lib/cart/store";
import type { CatalogProduct } from "@/lib/products";

interface ComboSimulatorProps {
  products: CatalogProduct[];
}

const PRODUCT_BRIEF_DESCRIPTIONS: Record<string, string> = {
  EBOOK: "Versão digital em PDF de alta qualidade enviada por e-mail",
  LIVRO_COLORIR: "20 páginas da sua aventura personalizadas para colorir",
  QUEBRA_CABECA: "Quebra-cabeça durável de 60 peças (21x29 cm)",
  CARTELA_ADESIVOS: "Cartela A4 com adesivos do protagonista e do tema",
};

export default function ComboSimulator({ products }: ComboSimulatorProps) {
  const mainProduct = products.find((p) => p.type === "LIVRO_PRINCIPAL");
  const addons = products.filter((p) => p.type !== "LIVRO_PRINCIPAL");

  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  if (!mainProduct) return null;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Pricing math
  const bookPrice = mainProduct.price;
  const selectedAddonList = addons.filter((a) => selectedAddons.includes(a.id));
  const addonsSubtotal = selectedAddonList.reduce((acc, a) => acc + a.price, 0);
  const subtotal = bookPrice + addonsSubtotal;
  
  // R$ 15 discount per addon unit when main book is included
  const discount = selectedAddons.length * 15;
  const total = Math.max(subtotal - discount, 0);

  const handleAddSelectedToCart = () => {
    // Add all selected addons to cart
    selectedAddonList.forEach((addon) => {
      addItem({
        id: addon.id,
        slug: addon.slug,
        name: addon.name,
        type: addon.type,
        price: addon.price,
      });
    });

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 5000);
  };

  const getAddonLabel = (type: string) => {
    switch (type) {
      case "EBOOK":
        return "Digital";
      case "LIVRO_COLORIR":
        return "Criativo";
      case "QUEBRA_CABECA":
        return "Brinquedo";
      case "CARTELA_ADESIVOS":
        return "Divertido";
      default:
        return "Extra";
    }
  };

  const getAddonImage = (type: string) => {
    switch (type) {
      case "EBOOK":
        return "/ebook_mockup.png";
      case "LIVRO_COLORIR":
        return "/coloring_book_mockup.png";
      case "QUEBRA_CABECA":
        return "/puzzle_mockup.png";
      case "CARTELA_ADESIVOS":
        return "/stickers_mockup.png";
      default:
        return "/book_cover.png";
    }
  };

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="bg-white rounded-[24px] border border-cream-deep/20 shadow-premium p-5 md:p-7 max-w-4xl mx-auto overflow-hidden">
      <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
        <span className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] block">
          Simulador de Preço
        </span>
        <h3 className="font-serif text-2xl text-primary font-medium">
          Monte seu Combo Mágico
        </h3>
        <p className="text-[11px] text-dark/65 leading-normal">
          Selecione itens extras e veja o desconto acumulando em tempo real. Cada adicional reduz <strong className="text-gold font-bold">R$ 15,00</strong> do valor final!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.25fr_0.75fr] gap-6 items-start">
        {/* Left Side: Product Selector List */}
        <div className="space-y-3 min-w-0">
          {/* Main Book (Fixed) */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-cream/35 border border-cream-deep/15 select-none opacity-85">
            <div className="relative w-10 h-14 rounded-md overflow-hidden shadow-sm flex-shrink-0">
              <Image src="/book_cover.png" alt="Livro Capa Dura" fill className="object-cover" sizes="40px" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-serif text-xs font-bold text-primary truncate">
                  {mainProduct.name}
                </h4>
                <span className="bg-primary/10 text-primary text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                  Item Base Obrigatório
                </span>
              </div>
              <p className="text-[9px] text-dark/50 truncate">Livro físico personalizado de capa dura (30x21 cm)</p>
            </div>
            <div className="text-right">
              <span className="font-serif text-xs font-bold text-primary">
                {formatBRL(bookPrice)}
              </span>
            </div>
            <div className="w-4 h-4 flex items-center justify-center rounded bg-primary text-cream text-[9px] flex-shrink-0">
              ✓
            </div>
          </div>

          {/* Addons List */}
          <div className="space-y-2">
            <span className="text-[8px] font-bold text-dark/45 uppercase tracking-wider block px-1">
              Selecione os Adicionais Mágicos:
            </span>

            {addons.map((a) => {
              const isChecked = selectedAddons.includes(a.id);
              return (
                <div
                  key={a.id}
                  onClick={() => toggleAddon(a.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                    isChecked
                      ? "bg-gold/5 border-gold shadow-sm"
                      : "bg-white border-cream-deep/15 hover:border-gold/30"
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-sm flex-shrink-0 bg-cream/10">
                    <Image src={getAddonImage(a.type)} alt={a.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-xs font-bold text-primary truncate">{a.name}</h4>
                      <span className="bg-gold/10 text-gold text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                        {getAddonLabel(a.type)}
                      </span>
                    </div>
                    <p className="text-[9px] text-dark/50 truncate">
                      {PRODUCT_BRIEF_DESCRIPTIONS[a.type] ?? a.description}
                    </p>
                  </div>
                  <div className="text-right pr-1 flex-shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="font-serif text-xs font-bold text-primary">
                        {formatBRL(a.price - 15)}
                      </span>
                      <span className="text-[8px] text-dark/35 line-through">
                        {formatBRL(a.price)}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 flex items-center justify-center rounded border flex-shrink-0 transition-all ${
                      isChecked
                        ? "bg-gold border-gold text-cream animate-scale-up"
                        : "border-cream-deep/30 bg-white"
                    }`}
                  >
                    {isChecked && <span className="text-[9px] font-bold">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Totals Card */}
        <div className="bg-cream/40 border border-cream-deep/20 rounded-xl p-4 md:p-5 space-y-4">
          <h4 className="font-serif text-sm font-bold text-primary pb-2 border-b border-cream-deep/25">
            Resumo do Combo
          </h4>

          <div className="space-y-2.5 text-xs text-dark/70">
            <div className="flex justify-between">
              <span>Subtotal do Combo</span>
              <span className="font-medium text-primary">
                {formatBRL(subtotal)}
              </span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-gold font-bold bg-gold/5 px-2 py-1 rounded border border-gold/10 text-[11px]">
                <span>Desconto Especial Combo</span>
                <span>-{formatBRL(discount)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-cream-deep/25 flex justify-between items-baseline">
              <span className="font-bold text-primary">Total do Combo</span>
              <div className="text-right">
                <span className="font-serif text-xl font-bold text-primary block">
                  {formatBRL(total)}
                </span>
                <span className="text-[9px] text-dark/40 block">ou 6x sem juros</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {selectedAddons.length > 0 && (
              <button
                onClick={handleAddSelectedToCart}
                className="w-full bg-gold text-cream hover:bg-gold-light active:scale-[0.98] py-2.5 rounded-full font-bold uppercase tracking-wider text-[10px] shadow-sm transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                <span>Adicionar Adicionais ao Carrinho</span>
                <span>✨</span>
              </button>
            )}

            <a
              href="/personalizar"
              className="w-full bg-primary text-cream hover:bg-primary-light active:scale-[0.98] py-2.5 rounded-full font-bold uppercase tracking-wider text-[10px] shadow-sm transition-all duration-300 block text-center"
            >
              Personalizar meu Livro →
            </a>
          </div>

          {isSuccess && (
            <div className="text-center text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 p-2 rounded-lg animate-fade-in">
              🎉 Adicionais inseridos! Personalize o livro principal para validar o desconto.
            </div>
          )}

          <p className="text-[8px] text-dark/45 text-center leading-normal">
            * Desconto de R$ 15,00 por adicional ativado com o Livro Capa Dura no carrinho.
          </p>
        </div>
      </div>
    </div>
  );
}
