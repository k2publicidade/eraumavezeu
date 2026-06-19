"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateContactStatus, updateContactNotes, deleteContactMessage } from "@/app/actions/contact";
import { ContactStatus } from "@prisma/client";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  initialMessages: Message[];
};

const STATUS_LABELS: Record<ContactStatus, string> = {
  NOVA: "Nova",
  LIDA: "Lida",
  RESPONDIDA: "Respondida",
  ARQUIVADA: "Arquivada",
};

const STATUS_CLASSES: Record<ContactStatus, string> = {
  NOVA: "bg-primary/10 text-primary border border-primary/20",
  LIDA: "bg-amber-50 text-amber-800 border border-amber-200",
  RESPONDIDA: "bg-forest/15 text-forest-dark border border-forest/30",
  ARQUIVADA: "bg-stone-100 text-stone-600 border border-stone-200",
};

export default function ContactMessagesDashboard({ initialMessages }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "TODAS">("TODAS");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [notesText, setNotesText] = useState("");
  
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Formata data brasileira: DD/MM/AAAA às HH:MM
  function formatDate(isoString: string) {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(isoString));
  }

  // Limpa números de celular para o link wa.me
  function getCleanPhone(phone: string | null) {
    if (!phone) return "";
    const clean = phone.replace(/\D/g, "");
    // Se não tiver código de país (55), adiciona
    return clean.length <= 11 ? `55${clean}` : clean;
  }

  const filteredMessages = initialMessages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.subject && msg.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "TODAS" || msg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Abre detalhes e popula o state das notas internas
  function openMessageDetails(msg: Message) {
    setSelectedMessage(msg);
    setNotesText(msg.notes || "");
    setSaveStatus("idle");

    // Marca como LIDA automaticamente ao abrir se estiver NOVA
    if (msg.status === ContactStatus.NOVA) {
      startTransition(async () => {
        await updateContactStatus(msg.id, ContactStatus.LIDA);
        router.refresh();
        // Atualiza no state local para consistência imediata
        setSelectedMessage(prev => prev ? { ...prev, status: ContactStatus.LIDA } : null);
      });
    }
  }

  function handleStatusChange(status: ContactStatus) {
    if (!selectedMessage) return;
    startTransition(async () => {
      await updateContactStatus(selectedMessage.id, status);
      setSelectedMessage(prev => prev ? { ...prev, status } : null);
      router.refresh();
    });
  }

  function handleSaveNotes() {
    if (!selectedMessage) return;
    setSaveStatus("saving");
    startTransition(async () => {
      try {
        await updateContactNotes(selectedMessage.id, notesText);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
        router.refresh();
      } catch (e) {
        setSaveStatus("error");
      }
    });
  }

  function handleDelete() {
    if (!selectedMessage) return;
    const confirmed = window.confirm("Excluir esta mensagem permanentemente? Esta ação não pode ser desfeita.");
    if (!confirmed) return;

    startTransition(async () => {
      await deleteContactMessage(selectedMessage.id);
      setSelectedMessage(null);
      router.refresh();
    });
  }

  const newCount = initialMessages.filter(m => m.status === ContactStatus.NOVA).length;

  return (
    <div className="space-y-6">
      
      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gold/20 bg-[#FCFAF7] p-4 shadow-sm">
          <p className="text-xs text-dark/50 font-medium">Não lidas (Novas)</p>
          <p className="mt-1 font-serif text-2xl text-primary font-bold flex items-center gap-2">
            {newCount}
            {newCount > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fox opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-fox"></span>
              </span>
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-gold/20 bg-[#FCFAF7] p-4 shadow-sm">
          <p className="text-xs text-dark/50 font-medium">Total recebido</p>
          <p className="mt-1 font-serif text-2xl text-primary font-bold">{initialMessages.length}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white rounded-3xl border border-gold/20 p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark/40 pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, email, assunto ou termo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gold/20 bg-cream-light text-xs text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatusFilter("TODAS")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition ${
              statusFilter === "TODAS"
                ? "bg-primary text-white"
                : "bg-cream text-primary hover:bg-gold/15"
            }`}
          >
            Todas
          </button>
          {(Object.keys(STATUS_LABELS) as ContactStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-cream text-primary hover:bg-gold/15"
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: List & Drawer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-6 items-start">
        
        {/* Messages List Table */}
        <div className="rounded-3xl border border-gold/25 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gold/25 bg-[#FCFAF7] text-primary font-bold text-xs uppercase tracking-wider">
                  <th className="px-4 py-4.5 font-semibold">Status</th>
                  <th className="px-4 py-4.5 font-semibold">Remetente</th>
                  <th className="px-4 py-4.5 font-semibold">Assunto</th>
                  <th className="px-4 py-4.5 font-semibold">Data</th>
                  <th className="px-4 py-4.5 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {filteredMessages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={`hover:bg-cream-light/35 transition cursor-pointer ${
                      selectedMessage?.id === msg.id ? "bg-cream-light/80" : ""
                    } ${msg.status === ContactStatus.NOVA ? "font-semibold" : ""}`}
                    onClick={() => openMessageDetails(msg)}
                  >
                    <td className="px-4 py-4.5 whitespace-nowrap">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_CLASSES[msg.status]}`}>
                        {STATUS_LABELS[msg.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4.5">
                      <p className="text-primary font-medium text-xs sm:text-sm">{msg.name}</p>
                      <p className="text-dark/45 text-[10px] sm:text-xs">{msg.email}</p>
                    </td>
                    <td className="px-4 py-4.5 max-w-[200px] truncate text-xs">
                      {msg.subject || "Sem Assunto"}
                    </td>
                    <td className="px-4 py-4.5 whitespace-nowrap text-xs text-dark/50">
                      {formatDate(msg.createdAt)}
                    </td>
                    <td className="px-4 py-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openMessageDetails(msg)}
                        className="text-xs text-primary hover:text-fox font-bold underline underline-offset-2"
                      >
                        Abrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMessages.length === 0 && (
            <div className="py-16 text-center text-dark/50 space-y-2">
              <span className="text-3xl block">✉️</span>
              <p className="text-xs font-semibold uppercase tracking-wider">Nenhuma mensagem encontrada.</p>
              <p className="text-[11px] text-dark/40">Tente buscar por outro termo ou alterar os filtros.</p>
            </div>
          )}
        </div>

        {/* Selected Message Detailed view (Drawer style) */}
        {selectedMessage ? (
          <div className="rounded-3xl border border-gold/25 bg-white p-6 shadow-sm space-y-6 lg:sticky lg:top-28 animate-fade-up">
            
            {/* Header info */}
            <div className="flex items-start justify-between gap-4 border-b border-gold/15 pb-4">
              <div>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${STATUS_CLASSES[selectedMessage.status]}`}>
                  {STATUS_LABELS[selectedMessage.status]}
                </span>
                <h2 className="mt-2 font-serif text-xl text-primary font-bold">{selectedMessage.name}</h2>
                <p className="text-xs text-dark/60 mt-0.5">{selectedMessage.email}</p>
                {selectedMessage.phone && (
                  <p className="text-xs text-dark/60 mt-0.5">Whats: {selectedMessage.phone}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-dark/45 hover:text-dark text-xs font-bold"
                title="Fechar detalhes"
              >
                ✕
              </button>
            </div>

            {/* Date and Subject */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-dark/40">Data de Envio</span>
                <span className="block text-primary font-medium mt-1">{formatDate(selectedMessage.createdAt)}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-dark/40">Assunto</span>
                <span className="block text-primary font-medium mt-1">{selectedMessage.subject || "Fale Conosco"}</span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-dark/40 mb-2">Mensagem</span>
              <div className="rounded-2xl border border-gold/15 bg-cream-light p-4 text-xs leading-relaxed text-dark max-h-60 overflow-y-auto whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            {/* Admin Response Shortcuts */}
            <div className="flex gap-2 border-t border-gold/15 pt-4">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || "Contato"}`}
                className="flex-1 btn-ghost text-xs py-2 px-3 flex items-center justify-center gap-1 font-bold rounded-xl"
              >
                ✉️ Responder E-mail
              </a>
              {selectedMessage.phone && (
                <a
                  href={`https://api.whatsapp.com/send?phone=${getCleanPhone(selectedMessage.phone)}&text=Olá, ${selectedMessage.name}. Sou o administrador do Era Uma Vez Eu, referente à sua mensagem...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] text-white hover:opacity-90 active:scale-95 text-xs py-2 px-3 flex items-center justify-center gap-1 font-bold rounded-xl transition duration-200 shadow-sm"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>

            {/* Notes Section (Internal Notes) */}
            <div className="border-t border-gold/15 pt-4 space-y-2">
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-dark/40 mb-1.5">Notas Administrativas Internas</span>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Anotações internas sobre o atendimento deste cliente (não visível para o cliente)..."
                  rows={3}
                  className="w-full rounded-2xl border border-gold/20 bg-cream-light p-3 text-xs text-dark outline-none focus:border-primary resize-none"
                />
              </label>
              
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleSaveNotes}
                  disabled={isPending || saveStatus === "saving"}
                  className="btn-primary text-xs py-2 px-4 rounded-xl"
                >
                  {saveStatus === "saving" ? "Salvando..." : saveStatus === "saved" ? "Salvo! ✓" : "Salvar Notas"}
                </button>
                {saveStatus === "error" && <span className="text-[10px] text-red-600 font-bold">Erro ao salvar</span>}
              </div>
            </div>

            {/* Status moderator actions & delete */}
            <div className="border-t border-gold/15 pt-4 space-y-4">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-dark/40 mb-2">Alterar Status</span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => handleStatusChange(ContactStatus.LIDA)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition border ${
                      selectedMessage.status === ContactStatus.LIDA
                        ? "bg-amber-100 border-amber-300 text-amber-800"
                        : "bg-cream-light border-gold/10 text-dark/65 hover:bg-gold/10"
                    }`}
                  >
                    Lida
                  </button>
                  <button
                    onClick={() => handleStatusChange(ContactStatus.RESPONDIDA)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition border ${
                      selectedMessage.status === ContactStatus.RESPONDIDA
                        ? "bg-forest/20 border-forest/40 text-forest-dark"
                        : "bg-cream-light border-gold/10 text-dark/65 hover:bg-gold/10"
                    }`}
                  >
                    Respondida
                  </button>
                  <button
                    onClick={() => handleStatusChange(ContactStatus.ARQUIVADA)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition border ${
                      selectedMessage.status === ContactStatus.ARQUIVADA
                        ? "bg-stone-200 border-stone-300 text-stone-700"
                        : "bg-cream-light border-gold/10 text-dark/65 hover:bg-gold/10"
                    }`}
                  >
                    Arquivada
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end border-t border-gold/10 pt-4">
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-xs text-red-600 hover:text-red-800 font-bold hover:underline"
                >
                  Excluir Mensagem 🗑️
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center rounded-3xl border border-dashed border-gold/25 bg-white/40 p-12 text-center text-dark/45 min-h-[350px]">
            <span className="text-4xl block mb-3">💬</span>
            <p className="text-xs font-semibold uppercase tracking-wider">Nenhuma mensagem selecionada</p>
            <p className="text-[10px] text-dark/40 max-w-[200px] mt-1 mx-auto leading-relaxed">
              Clique em uma mensagem da tabela para ver os detalhes, salvar notas ou responder.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
