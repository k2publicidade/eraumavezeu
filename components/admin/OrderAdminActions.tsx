"use client";

import { useState, useTransition } from "react";
import { setTrackingCode, updateOrderStatus, resendNotification, simulatePaymentApproval } from "@/app/actions/admin-orders";
import {
  issueNfe,
  cancelNfe,
  issueShippingLabel,
} from "@/app/actions/admin-shipping-nfe";
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
  nfeStatus: initialNfeStatus,
  nfeKey: initialNfeKey,
  nfeNumber: initialNfeNumber,
  nfeSeries: initialNfeSeries,
  nfeXml,
  shippingLabelStatus: initialShippingLabelStatus,
  shippingLabelId: initialShippingLabelId,
  shippingLabelUrl: initialShippingLabelUrl,
}: {
  orderId: string;
  currentStatus: string;
  trackingCode: string | null;
  nfeStatus?: string | null;
  nfeKey?: string | null;
  nfeNumber?: string | null;
  nfeSeries?: string | null;
  nfeXml?: string | null;
  shippingLabelStatus?: string | null;
  shippingLabelId?: string | null;
  shippingLabelUrl?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [toStatus, setToStatus] = useState<OrderStatusValue | "">("");
  const [note, setNote] = useState("");
  const [tracking, setTracking] = useState(trackingCode ?? "");
  const [feedback, setFeedback] = useState<Feedback>(null);

  // States to reflect real-time changes without full reload when server actions resolve
  const [nfeStatus, setNfeStatus] = useState(initialNfeStatus || "NENHUMA");
  const [nfeKey, setNfeKey] = useState(initialNfeKey || "");
  const [nfeNumber, setNfeNumber] = useState(initialNfeNumber || "");
  const [nfeSeries, setNfeSeries] = useState(initialNfeSeries || "");
  const [shippingLabelStatus, setShippingLabelStatus] = useState(initialShippingLabelStatus || "NENHUMA");
  const [shippingLabelId, setShippingLabelId] = useState(initialShippingLabelId || "");
  const [shippingLabelUrl, setShippingLabelUrl] = useState(initialShippingLabelUrl || "");

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
          ? { kind: "ok", text: "Código de rastreio salvou." }
          : { kind: "error", text: res.error },
      );
    });
  }

  function handleEmitNfe(simulate: boolean) {
    setFeedback(null);
    startTransition(async () => {
      const res = await issueNfe(orderId, simulate);
      if (res.ok) {
        setFeedback({ kind: "ok", text: `NF-e emitida com sucesso (${simulate ? "Simulada" : "Real"}).` });
        setNfeStatus("EMITIDA");
        // Refetch/reload page to update keys, numbers, and series
        window.location.reload();
      } else {
        setFeedback({ kind: "error", text: res.error });
      }
    });
  }

  function handleCancelNfe() {
    if (!confirm("Tem certeza que deseja cancelar esta nota fiscal?")) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await cancelNfe(orderId);
      if (res.ok) {
        setFeedback({ kind: "ok", text: "NF-e cancelada com sucesso." });
        setNfeStatus("CANCELADA");
        window.location.reload();
      } else {
        setFeedback({ kind: "error", text: res.error });
      }
    });
  }

  function handleEmitShippingLabel(simulate: boolean) {
    setFeedback(null);
    startTransition(async () => {
      const res = await issueShippingLabel(orderId, simulate);
      if (res.ok) {
        setFeedback({ kind: "ok", text: `Etiqueta de envio gerada com sucesso (${simulate ? "Simulada" : "Real"}).` });
        setShippingLabelStatus("GERADA");
        window.location.reload();
      } else {
        setFeedback({ kind: "error", text: res.error });
      }
    });
  }

  function downloadXml() {
    if (!nfeXml) return;
    const blob = new Blob([nfeXml], { type: "text/xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NFe-${nfeKey || orderId}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* 1. Mudar Status */}
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

      {/* 2. NF-e (Nota Fiscal) */}
      <div className="border-t border-gold/20 pt-4">
        <h3 className="font-medium text-primary flex items-center gap-1.5">
          <span>🧾</span> Nota Fiscal (NF-e)
        </h3>
        
        {nfeStatus === "EMITIDA" ? (
          <div className="mt-2 space-y-2">
            <div className="rounded-xl border border-forest/30 bg-forest/5 p-3 text-xs text-dark">
              <p className="font-semibold text-forest-dark flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-forest"></span>
                Nota Emitida com Sucesso
              </p>
              <p className="mt-1 text-dark/70">Nº: {nfeNumber} | Série: {nfeSeries}</p>
              <p className="mt-1 font-mono text-[10px] break-all select-all text-dark/60">Chave: {nfeKey}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <a
                href={`/admin/pedidos/${orderId}/danfe`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-center text-xs py-2 border border-gold/30 hover:bg-gold/10 flex justify-center items-center gap-1.5"
              >
                🖨️ Visualizar DANFE
              </a>
              {nfeXml && (
                <button
                  type="button"
                  onClick={downloadXml}
                  className="btn-ghost text-center text-xs py-2 border border-gold/30 hover:bg-gold/10 flex justify-center items-center gap-1.5"
                >
                  📥 Baixar XML da Nota
                </button>
              )}
              <button
                type="button"
                onClick={handleCancelNfe}
                disabled={isPending}
                className="text-[11px] text-red-600 hover:text-red-700 font-semibold underline text-center mt-1"
              >
                Cancelar Nota Fiscal
              </button>
            </div>
          </div>
        ) : nfeStatus === "CANCELADA" ? (
          <div className="mt-2">
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <p className="font-semibold">Nota Cancelada</p>
              <p className="mt-1 font-mono text-[9px] break-all text-red-600/70">Chave: {nfeKey}</p>
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-dark/55">Nenhuma nota fiscal emitida.</p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handleEmitNfe(true)}
                disabled={isPending}
                className="btn-ghost text-center text-xs py-2 border border-amber-600/30 text-amber-800 hover:bg-amber-50 flex justify-center items-center gap-1.5"
              >
                ⚙️ Emitir NF-e (Simulada)
              </button>
              <button
                type="button"
                onClick={() => handleEmitNfe(false)}
                disabled={isPending}
                className="btn-ghost text-center text-xs py-2 border border-gold/30 hover:bg-gold/10 flex justify-center items-center gap-1.5"
              >
                🚀 Emitir NF-e (Produção/Real)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Etiqueta de Envio (Melhor Envio) */}
      <div className="border-t border-gold/20 pt-4">
        <h3 className="font-medium text-primary flex items-center gap-1.5">
          <span>🚚</span> Etiqueta de Envio
        </h3>
        
        {shippingLabelStatus === "GERADA" ? (
          <div className="mt-2 space-y-2">
            <div className="rounded-xl border border-forest/30 bg-forest/5 p-3 text-xs text-dark">
              <p className="font-semibold text-forest-dark flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-forest"></span>
                Etiqueta Pronta
              </p>
              <p className="mt-1 text-dark/70">ID Melhor Envio: {shippingLabelId}</p>
              {trackingCode && <p className="mt-0.5 text-dark/70">Rastreio: <span className="font-mono font-semibold">{trackingCode}</span></p>}
            </div>
            
            <a
              href={shippingLabelUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-center text-xs py-2.5 flex justify-center items-center gap-1.5"
            >
              🏷️ Imprimir Etiqueta
            </a>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-dark/55">Nenhuma etiqueta emitida.</p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handleEmitShippingLabel(true)}
                disabled={isPending}
                className="btn-ghost text-center text-xs py-2 border border-amber-600/30 text-amber-800 hover:bg-amber-50 flex justify-center items-center gap-1.5"
              >
                ⚙️ Gerar Etiqueta (Simulada)
              </button>
              <button
                type="button"
                onClick={() => handleEmitShippingLabel(false)}
                disabled={isPending}
                className="btn-ghost text-center text-xs py-2 border border-gold/30 hover:bg-gold/10 flex justify-center items-center gap-1.5"
              >
                🚀 Gerar Etiqueta (Real API)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Código de Rastreio Manual */}
      <div className="border-t border-gold/20 pt-4">
        <h3 className="font-medium text-primary">Código de rastreio manual</h3>
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
      </div>

      {/* 5. Comunicação Manual */}
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
      </div>

      {/* 6. Simulação de Pagamento */}
      {process.env.NODE_ENV !== "production" && currentStatus === "AGUARDANDO_PAGAMENTO" && (
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
