"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatBRL } from "@/lib/format";

interface SimulatedCheckoutClientProps {
  orderId: string;
  orderCode: string;
  total: number;
  buyerName: string;
  buyerEmail: string;
  items: { name: string; quantity: number; price: number }[];
}

export default function SimulatedCheckoutClient({
  orderId,
  orderCode,
  total,
  buyerName,
  buyerEmail,
  items,
}: SimulatedCheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSimulate(paymentStatus: "APROVADO" | "REJEITADO") {
    setLoading(true);
    setStatus(paymentStatus === "APROVADO" ? "Aprovando pagamento..." : "Recusando pagamento...");

    try {
      const res = await fetch("/api/webhook/simulado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: paymentStatus }),
      });

      if (res.ok) {
        if (paymentStatus === "APROVADO") {
          router.push(`/pedido/${orderId}?payment=success`);
        } else {
          router.push(`/pedido/${orderId}?payment=failure`);
        }
      } else {
        alert("Erro ao simular o pagamento. Tente novamente.");
        setLoading(false);
        setStatus(null);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao simular pagamento.");
      setLoading(false);
      setStatus(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto my-10 px-4">
      {/* simulated header badge */}
      <div className="flex justify-center mb-6">
        <span className="bg-secondary/10 text-secondary text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          ⚙️ Modo de Simulação
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-gold/15 shadow-xl overflow-hidden">
        {/* top header banner */}
        <div className="bg-gradient-to-r from-secondary via-primary to-orange-500 p-6 text-white text-center">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold">Simulador de Pagamento</h1>
          <p className="text-white/80 text-sm mt-1">
            Esta tela simula o ambiente de checkout externo do gateway de pagamento.
          </p>
        </div>

        {/* order brief info */}
        <div className="p-6 border-b border-gold/10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs text-dark/50 uppercase font-medium">Pedido</p>
              <h2 className="text-lg font-semibold text-primary">#{orderCode}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-dark/50 uppercase font-medium">Total do Pedido</p>
              <p className="text-xl font-bold text-dark">{formatBRL(total)}</p>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-gold/5">
            <p className="text-sm text-dark/70">
              <span className="font-semibold">Cliente:</span> {buyerName}
            </p>
            <p className="text-sm text-dark/70">
              <span className="font-semibold">E-mail:</span> {buyerEmail}
            </p>
          </div>
        </div>

        {/* items list */}
        <div className="p-6 bg-cream/30 border-b border-gold/10 max-h-48 overflow-y-auto">
          <h3 className="text-xs font-semibold text-dark/55 uppercase tracking-wider mb-3">Itens da Compra</h3>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-dark/80">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium text-dark">{formatBRL(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* actions box */}
        <div className="p-8 text-center bg-cream/10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-sm font-medium text-primary">{status}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-dark/65 mb-6">
                Como deseja prosseguir com a simulação do seu pedido?
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleSimulate("APROVADO")}
                  className="bg-forest hover:bg-forest/90 text-white font-medium py-3.5 px-6 rounded-2xl shadow-md transition duration-300 hover:-translate-y-0.5"
                >
                  ✓ Aprovar Pagamento
                </button>
                <button
                  onClick={() => handleSimulate("REJEITADO")}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-3.5 px-6 rounded-2xl shadow-md transition duration-300 hover:-translate-y-0.5"
                >
                  ✗ Recusar Pagamento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-center text-xs text-dark/40 mt-4 leading-relaxed">
        Nota: Em um cenário real, o usuário seria redirecionado para a página segura da operadora de cartões ou PIX, e o webhook notificaria nosso servidor em segundo plano.
      </p>
    </div>
  );
}
