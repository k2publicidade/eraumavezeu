"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatBRL } from "@/lib/format";
import { orderCodeOf } from "@/lib/orders/build-order";
import { STATUS_LABELS, type OrderStatusValue } from "@/lib/orders/status";
import {
  issueNfe,
  issueShippingLabel,
  bulkIssueNfe,
  bulkIssueShippingLabels,
} from "@/app/actions/admin-shipping-nfe";

export interface EnviosOrder {
  id: string;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  guestCpf: string | null;
  status: string;
  total: any;
  createdAt: Date;
  trackingCode: string | null;
  nfeKey: string | null;
  nfeStatus: string | null;
  nfeNumber: string | null;
  nfeSeries: string | null;
  nfeXml: string | null;
  shippingLabelId: string | null;
  shippingLabelUrl: string | null;
  shippingLabelStatus: string | null;
}

export default function EnviosDashboard({ initialOrders }: { initialOrders: EnviosOrder[] }) {
  const [orders, setOrders] = useState<EnviosOrder[]>(initialOrders);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  
  // Filters
  const [nfeFilter, setNfeFilter] = useState<"ALL" | "PENDING" | "EMITTED">("ALL");
  const [labelFilter, setLabelFilter] = useState<"ALL" | "PENDING" | "GENERATED">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Bulk operation status
  const [operationLogs, setOperationLogs] = useState<{
    successes: number;
    failures: number;
    errors: string[];
  } | null>(null);

  // Filter orders based on user inputs
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderCodeOf(order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.guestCpf?.includes(searchTerm);

    const matchesNfe =
      nfeFilter === "ALL" ||
      (nfeFilter === "PENDING" && order.nfeStatus !== "EMITIDA") ||
      (nfeFilter === "EMITTED" && order.nfeStatus === "EMITIDA");

    const matchesLabel =
      labelFilter === "ALL" ||
      (labelFilter === "PENDING" && order.shippingLabelStatus !== "GERADA") ||
      (labelFilter === "GENERATED" && order.shippingLabelStatus === "GERADA");

    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesNfe && matchesLabel && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredOrders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    }
  };

  // Trigger individual NF-e Emission
  const triggerSingleNfe = (orderId: string, simulate: boolean) => {
    setOperationLogs(null);
    startTransition(async () => {
      const res = await issueNfe(orderId, simulate);
      if (res.ok) {
        // Optimistic UI state update or window reload
        window.location.reload();
      } else {
        alert(`Erro ao emitir NF-e: ${res.error}`);
      }
    });
  };

  // Trigger individual Label Emission
  const triggerSingleLabel = (orderId: string, simulate: boolean) => {
    setOperationLogs(null);
    startTransition(async () => {
      const res = await issueShippingLabel(orderId, simulate);
      if (res.ok) {
        window.location.reload();
      } else {
        alert(`Erro ao emitir etiqueta: ${res.error}`);
      }
    });
  };

  // Trigger Bulk NF-e Emission
  const triggerBulkNfe = (simulate: boolean) => {
    if (selectedIds.length === 0) return;
    setOperationLogs(null);
    startTransition(async () => {
      const res = await bulkIssueNfe(selectedIds, simulate);
      setOperationLogs({
        successes: res.successes,
        failures: res.failures,
        errors: res.errors,
      });
      setSelectedIds([]);
      if (res.successes > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    });
  };

  // Trigger Bulk Label Emission
  const triggerBulkLabels = (simulate: boolean) => {
    if (selectedIds.length === 0) return;
    setOperationLogs(null);
    startTransition(async () => {
      const res = await bulkIssueShippingLabels(selectedIds, simulate);
      setOperationLogs({
        successes: res.successes,
        failures: res.failures,
        errors: res.errors,
      });
      setSelectedIds([]);
      if (res.successes > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    });
  };

  const handleDownloadXml = (order: EnviosOrder) => {
    if (!order.nfeXml) return;
    const blob = new Blob([order.nfeXml], { type: "text/xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NFe-${order.nfeKey || order.id}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const eligibleOrderStatuses = [
    "PAGAMENTO_CONFIRMADO",
    "EM_PRODUCAO",
    "AGUARDANDO_ENVIO",
    "ENVIADO",
    "ENTREGUE",
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-fox">Expedição</p>
          <h1 className="mt-2 font-serif text-4xl text-primary">Central de Envios & Faturamento</h1>
          <p className="mt-2 text-dark/60">Gere notas fiscais eletrônicas e chancelas de postagem do Melhor Envio em lote.</p>
        </div>
        <div>
          <Link href="/admin/pedidos" className="btn-ghost">
            ← Ver Pedidos
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-3xl border border-gold/25 bg-cream-light p-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1.5">Buscar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome, CPF, ID..."
              className="input-field w-full text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1.5">Nota Fiscal</label>
            <select
              value={nfeFilter}
              onChange={(e) => setNfeFilter(e.target.value as any)}
              className="input-field w-full text-xs"
            >
              <option value="ALL">Todas as notas</option>
              <option value="PENDING">Sem NF-e (Pendente)</option>
              <option value="EMITTED">Emitidas</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1.5">Etiqueta</label>
            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value as any)}
              className="input-field w-full text-xs"
            >
              <option value="ALL">Todas as etiquetas</option>
              <option value="PENDING">Sem Etiqueta (Pendente)</option>
              <option value="GENERATED">Geradas</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1.5">Status do Pedido</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-full text-xs"
            >
              <option value="ALL">Todos os status</option>
              {eligibleOrderStatuses.map((st) => (
                <option key={st} value={st}>
                  {STATUS_LABELS[st as OrderStatusValue] || st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Operation Logs */}
      {operationLogs && (
        <div className={`p-4 rounded-2xl border text-sm ${
          operationLogs.failures === 0 
            ? "bg-forest/10 border-forest/30 text-forest-dark" 
            : "bg-fox/10 border-fox/30 text-fox-dark"
        }`}>
          <p className="font-semibold">Resultado do processamento em lote:</p>
          <ul className="mt-2 list-inside list-disc text-xs space-y-1">
            <li>Sucessos: {operationLogs.successes}</li>
            <li>Falhas: {operationLogs.failures}</li>
            {operationLogs.errors.map((err, i) => (
              <li key={i} className="text-red-700 font-mono mt-1">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bulk Actions Panel */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 animate-fade-in">
          <span className="text-sm font-semibold text-primary">
            {selectedIds.length} {selectedIds.length === 1 ? "pedido selecionado" : "pedidos selecionados"}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerBulkNfe(true)}
              disabled={isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition disabled:opacity-50"
            >
              🧾 Emitir NF-e (Simulada)
            </button>
            <button
              onClick={() => triggerBulkNfe(false)}
              disabled={isPending}
              className="bg-gold hover:bg-gold-dark text-primary px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition disabled:opacity-50"
            >
              🚀 Emitir NF-e (Real)
            </button>
            <button
              onClick={() => triggerBulkLabels(true)}
              disabled={isPending}
              className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition disabled:opacity-50"
            >
              ⚙️ Gerar Etiqueta (Simulada)
            </button>
            <button
              onClick={() => triggerBulkLabels(false)}
              disabled={isPending}
              className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition disabled:opacity-50"
            >
              🏷️ Gerar Etiqueta (Real)
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-gold/25 bg-cream-light p-12 text-center text-dark/60">
          Nenhum pedido elegível encontrado para os filtros selecionados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-gold/25 bg-cream-light">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/25 text-left text-primary bg-cream/40">
                <th className="px-4 py-3.5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredOrders.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gold/30 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    aria-label="Selecionar todos os pedidos"
                  />
                </th>
                <th className="px-4 py-3.5 font-medium">Pedido</th>
                <th className="px-4 py-3.5 font-medium">Destinatário</th>
                <th className="px-4 py-3.5 font-medium">NF-e Status</th>
                <th className="px-4 py-3.5 font-medium text-center">DANFE / XML</th>
                <th className="px-4 py-3.5 font-medium">Etiqueta Status</th>
                <th className="px-4 py-3.5 font-medium text-center">Despacho</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const isSelected = selectedIds.includes(order.id);
                return (
                  <tr
                    key={order.id}
                    className={`border-b border-gold/15 last:border-0 hover:bg-cream transition-colors ${
                      isSelected ? "bg-cream-deep/10" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(order.id, e.target.checked)}
                        className="rounded border-gold/30 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                        aria-label={`Selecionar pedido ${orderCodeOf(order.id)}`}
                      />
                    </td>

                    {/* Order Code & Status */}
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="font-semibold text-primary underline-offset-2 hover:underline block"
                      >
                        #{orderCodeOf(order.id)}
                      </Link>
                      <span className="text-[10px] text-dark/55 block mt-0.5">
                        {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
                          new Date(order.createdAt)
                        )}
                      </span>
                      <span className="inline-block rounded-full bg-cream-deep/30 px-2 py-0.5 text-[10px] font-semibold text-primary mt-1">
                        {STATUS_LABELS[order.status as OrderStatusValue] || order.status}
                      </span>
                    </td>

                    {/* Customer details */}
                    <td className="px-4 py-3.5 text-xs">
                      <p className="font-semibold text-dark">{order.guestName || "Cliente"}</p>
                      <p className="text-dark/60 mt-0.5">{order.guestPhone || "Sem telefone"}</p>
                      <p className="text-dark/45 mt-0.5">CPF: {order.guestCpf || "—"}</p>
                    </td>

                    {/* NF-e Status */}
                    <td className="px-4 py-3.5">
                      {order.nfeStatus === "EMITIDA" ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest">
                            <span className="h-1.5 w-1.5 rounded-full bg-forest"></span>
                            Emitida (Nº {order.nfeNumber})
                          </span>
                          <span className="text-[9px] text-dark/45 font-mono truncate max-w-[120px]" title={order.nfeKey || ""}>
                            Key: {order.nfeKey}
                          </span>
                        </div>
                      ) : order.nfeStatus === "CANCELADA" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
                          Cancelada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-dark/45">
                          <span className="h-1.5 w-1.5 rounded-full bg-dark/30"></span>
                          Pendente
                        </span>
                      )}
                    </td>

                    {/* NF-e Actions */}
                    <td className="px-4 py-3.5 text-center">
                      {order.nfeStatus === "EMITIDA" ? (
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`/admin/pedidos/${order.id}/danfe`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white border border-gold/30 hover:bg-gold/5 text-primary text-xs font-medium px-2.5 py-1 rounded-xl transition"
                            title="Imprimir DANFE"
                          >
                            🖨️ DANFE
                          </a>
                          {order.nfeXml && (
                            <button
                              onClick={() => handleDownloadXml(order)}
                              className="bg-white border border-gold/30 hover:bg-gold/5 text-primary text-xs font-medium px-2.5 py-1 rounded-xl transition"
                              title="Baixar XML"
                            >
                              📥 XML
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 max-w-[130px] mx-auto">
                          <button
                            onClick={() => triggerSingleNfe(order.id, true)}
                            disabled={isPending}
                            className="bg-amber-600/10 hover:bg-amber-600/20 text-amber-800 text-[10px] font-semibold py-1 rounded-lg transition"
                          >
                            ⚙️ Simular Nota
                          </button>
                          <button
                            onClick={() => triggerSingleNfe(order.id, false)}
                            disabled={isPending}
                            className="bg-cream border border-gold/25 hover:bg-gold/5 text-primary text-[10px] font-semibold py-1 rounded-lg transition"
                          >
                            🚀 Emitir Real
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Shipping Label Status */}
                    <td className="px-4 py-3.5">
                      {order.shippingLabelStatus === "GERADA" ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest">
                            <span className="h-1.5 w-1.5 rounded-full bg-forest"></span>
                            Gerada
                          </span>
                          {order.trackingCode && (
                            <span className="text-[10px] font-mono font-semibold text-dark/70 mt-0.5">
                              {order.trackingCode}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-dark/45">
                          <span className="h-1.5 w-1.5 rounded-full bg-dark/30"></span>
                          Não Gerada
                        </span>
                      )}
                    </td>

                    {/* Shipping Label Actions */}
                    <td className="px-4 py-3.5 text-center">
                      {order.shippingLabelStatus === "GERADA" ? (
                        <a
                          href={order.shippingLabelUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-primary hover:bg-primary-dark text-white text-xs font-medium px-3 py-1.5 rounded-xl inline-block transition"
                        >
                          🏷️ Imprimir
                        </a>
                      ) : (
                        <div className="flex flex-col gap-1 max-w-[130px] mx-auto">
                          <button
                            onClick={() => triggerSingleLabel(order.id, true)}
                            disabled={isPending}
                            className="bg-amber-600/10 hover:bg-amber-600/20 text-amber-800 text-[10px] font-semibold py-1 rounded-lg transition"
                          >
                            ⚙️ Simular Etq
                          </button>
                          <button
                            onClick={() => triggerSingleLabel(order.id, false)}
                            disabled={isPending}
                            className="bg-cream border border-gold/25 hover:bg-gold/5 text-primary text-[10px] font-semibold py-1 rounded-lg transition"
                          >
                            🚀 Gerar Real
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
