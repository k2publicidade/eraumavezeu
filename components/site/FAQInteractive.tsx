"use client";

import { useState, useMemo } from "react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQInteractiveProps {
  items: FaqItem[];
  whatsappNumber: string;
}

const CATEGORIES = [
  { id: "all", label: "Todas as Perguntas" },
  { id: "personalizacao", label: "Personalização & Fotos" },
  { id: "envio", label: "Envio & Prazos" },
  { id: "pagamento", label: "Pagamentos & Cadastro" },
];

export default function FAQInteractive({ items, whatsappNumber }: FAQInteractiveProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  // Helper to map FAQ item to a category
  const getItemCategory = (id: string): string => {
    const personalizationIds = ["ia-revisao-humana", "fotos-publicas", "faixa-etaria", "fotos-ideais", "presente"];
    const shippingIds = ["prazo-entrega", "envio-brasil", "acompanhar-pedido"];
    
    if (personalizationIds.includes(id)) {
      return "personalizacao";
    }
    if (shippingIds.includes(id)) {
      return "envio";
    }
    return "pagamento";
  };

  // Calculate counts for categories based on the raw items
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    
    CATEGORIES.forEach((cat) => {
      if (cat.id !== "all") {
        counts[cat.id] = 0;
      }
    });

    items.forEach((item) => {
      const cat = getItemCategory(item.id);
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts[cat] = 1;
      }
    });

    return counts;
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = activeCategory === "all" || getItemCategory(item.id) === activeCategory;
      const matchesSearch =
        searchQuery === "" ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8 items-start max-w-5xl mx-auto">
      {/* 1. LEFT SIDEBAR: CATEGORY NAVIGATION */}
      <div className="space-y-4 lg:sticky lg:top-24">
        {/* Search Bar on Mobile/Desktop */}
        <div className="relative">
          <input
            type="text"
            aria-label="Pesquisar perguntas frequentes"
            placeholder="Pesquisar dúvidas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-11 pl-10 pr-16 py-3 rounded-xl border border-cream-deep/30 bg-white/70 text-sm placeholder:text-dark/65 focus:border-gold focus:bg-white focus:outline-none transition-colors"
          />
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-dark/40">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button
              type="button"
              aria-label="Limpar pesquisa"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-1 flex min-w-11 items-center justify-center text-dark/60 hover:text-primary text-xs font-bold"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Categories Bar (Mobile: Horizontal list, Desktop: Vertical buttons) */}
        <div className="flex lg:flex-col overflow-x-auto pb-2 lg:pb-0 gap-2 scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;
            
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenItemId(null); // Reset open item on category change
                }}
                className={`min-h-11 flex-shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-colors text-sm font-semibold select-none ${
                  isActive
                    ? "bg-primary border-primary text-cream shadow-sm"
                    : "bg-white border-cream-deep/20 text-dark/70 hover:border-gold/30 hover:text-dark"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-cream" : "bg-cream-deep/30 text-dark/65"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT PANEL: ACCORDIONS LIST */}
      <div className="space-y-3 min-w-0">
        {filteredItems.length > 0 ? (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const isOpen = openItemId === item.id;
              
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "border-gold/45 shadow-sm bg-white"
                      : "border-cream-deep/15 hover:border-gold/25"
                  }`}
                >
                  {/* Question Button */}
                  <button
                    id={`faq-question-${item.id}`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    onClick={() => toggleItem(item.id)}
                    className="w-full min-h-14 text-left px-5 py-4 flex items-center justify-between gap-4 font-serif text-base font-bold text-primary hover:bg-gold/5 transition-colors select-none"
                  >
                    <span>{item.question}</span>
                    <div
                      aria-hidden="true"
                      className={`w-6 h-6 rounded-full border border-cream-deep/25 flex items-center justify-center text-xs transition-transform duration-300 ${
                        isOpen ? "rotate-180 border-gold/40 text-gold bg-gold/5" : "text-dark/45"
                      }`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${item.id}`}
                      role="region"
                      aria-labelledby={`faq-question-${item.id}`}
                      className="border-t border-cream-deep/15 p-5 text-sm text-dark/80 leading-relaxed font-body animate-fade-up"
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="bg-white/50 border border-gold/20 rounded-2xl p-8 text-center space-y-4">
            <span className="text-3xl block select-none">🧐</span>
            <div className="space-y-1">
              <h4 className="font-serif text-base font-bold text-primary">Nenhuma pergunta encontrada</h4>
              <p className="text-[11px] text-dark/65 max-w-sm mx-auto leading-normal font-body">
                Não encontramos nenhuma dúvida correspondente à sua busca. Quer falar diretamente com nossa equipe e tirar sua dúvida?
              </p>
            </div>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#187B3D] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#126533] active:scale-[0.98]"
            >
              <span>Perguntar no WhatsApp</span>
              <span>💬</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
