"use client";

import { useState, useTransition } from "react";
import { setTrackingCode, updateOrderStatus, resendNotification, simulatePaymentApproval } from "@/app/actions/admin-orders";
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  type OrderStatusValue,
} from "@/lib/orders/status";

type Feedback = { kind: "ok" | "error"; text: string } | null;

export default function OrderAdminActions({
  orderId,
  currentStatus,
  trackingCode,
}: {
  orderId: string;
  currentStatus: string;
  trackingCode: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [toStatus, setToStatus] = useState<OrderStatusValue | "">("");
  const [note, setNote] = useState("");
  const [tracking, setTracking] = useState(trackingCode ?? "");
  const [feedback, setFeedback] = useState<Feedback>(null);

  function handleResend(channel: "email" | "whatsapp") {
    setFeedback(null);
    startTransition(async () => {
      const res = await resendNotification({ orderId, channel });
      if (res.ok) {
        setFeedback({
          kind: "ok",
          text: `Notificação enviada por ${channel === "email" ? "e-mail" : "WhatsApp"} com sucesso!`,
        });
      } else {
        setFeedback({ kind: "error", text: res.error });
      }
    });
  }

  function handleSimulatePayment() {
    setFeedback(null);
    startTransition(async () => {
      const res = await simulatePaymentApproval({ orderId });
      if (res.ok) {
        setFeedback({
          kind: "ok",
          text: "Sucesso! Pagamento simulado e confirmado — produção iniciada.",
        });
      } else {
        setFeedback({ kind: "error", text: res.error });
      }
    });
  }

  function submitStatus() {
    if (!toStatus) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await updateOrderStatus({ orderId, toStatus, note: note || undefined });
      if (res.ok) {
        setFeedback({ kind: "ok", text: "Status atualizado — cliente notificado." });
        setToStatus("");
        setNote("");
      } else {
        setFeedback({ kind: "error", text: res.error });
      }
    });
  }

  function submitTracking() {
    setFeedback(null);
    startTransition(async () => {
      const res = await setTrackingCode({ orderId, trackingCode: tracking });
      setFeedback(
        res.ok
          ? { kind: "ok", text: "Código de rastreio salvo." }
          : { kind: "error", text: res.error },
      );
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-primary">Mudar status</h3>
        <div className="mt-2 flex flex-col gap-2">
          <select
            value={toStatus}
            onChange={(e) => setToStatus(e.target.value as OrderStatusValue | "")}
            disabled={isPending}
            className="input-field"
            aria-label="Novo status do pedido"
          >
            <option value="">Selecione o novo status…</option>
            {ORDER_STATUSES.filter((s) => s !== currentStatus).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
            rows={2}
            maxLength={500}
            placeholder="Nota interna (opcional)"
            className="input-field"
            aria-label="Nota interna da mudança de status"
          />
          <button
            type="button"
            onClick={submitStatus}
            disabled={isPending || !toStatus}
            className="btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Salvando…" : "Atualizar status"}
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-primary">Código de rastreio</h3>
        <div className="mt-2 flex gap-2">
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            disabled={isPending}
            placeholder="Ex.: AA123456789BR"
            className="input-field flex-1"
            aria-label="Código de rastreio"
          />
          <button
            type="button"
            onClick={submitTracking}
            disabled={isPending || tracking.trim().length < 3}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
        </div>
        <p className="mt-1 text-xs text-dark/55">
          Salve o rastreio ANTES de mudar para “Enviado” — a mensagem ao cliente inclui o código.
        </p>
      </div>

      <div>
        <h3 className="font-medium text-primary">Comunicação manual</h3>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => handleResend("email")}
            disabled={isPending}
            className="btn-ghost flex-1 text-center py-2 text-xs border border-gold/30 hover:bg-gold/10"
          >
            Reenviar E-mail
          </button>
          <button
            type="button"
            onClick={() => handleResend("whatsapp")}
            disabled={isPending}
            className="btn-ghost flex-1 text-center py-2 text-xs border border-gold/30 hover:bg-gold/10"
          >
            Reenviar WhatsApp
          </button>
        </div>
        <p className="mt-1 text-xs text-dark/55">
          Dispara uma mensagem de melhor esforço com o status atual do pedido.
        </p>
      </div>

      {currentStatus === "AGUARDANDO_PAGAMENTO" && (
        <div className="border-t border-gold/20 pt-4">
          <h3 className="font-medium text-amber-800">Simulação de Vendas</h3>
          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={isPending}
            className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isPending ? "Processando…" : "Simular Pagamento Aprovado 💳"}
          </button>
          <p className="mt-1 text-[11px] text-amber-900/60 leading-normal">
            Apenas para testes. Simula a chamada do webhook do Mercado Pago, atualiza os dados e envia e-mail de confirmação.
          </p>
        </div>
      )}

      {feedback && (
        <p
          role="alert"
          className={`rounded-xl px-4 py-3 text-sm ${
            feedback.kind === "ok"
              ? "border border-forest/30 bg-forest/10 text-forest"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}
