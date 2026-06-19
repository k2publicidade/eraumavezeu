"use client";

import { useState, useTransition, useRef } from "react";
import {
  deleteFaqItem,
  saveFaqItem,
  seedDefaultFaqItems,
  toggleFaqItem,
} from "@/app/actions/admin-content";
import type { FaqItem } from "@/lib/site-content";

function FaqFields({ item, disabled }: { item?: FaqItem; disabled?: boolean }) {
  return (
    <>
      {item?.id && <input type="hidden" name="id" value={item.id} />}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_120px]">
        <label>
          <span className="text-sm font-medium text-primary">Pergunta</span>
          <input
            name="question"
            defaultValue={item?.question ?? ""}
            required
            disabled={disabled}
            className="mt-2 w-full rounded-2xl border border-gold/30 bg-cream-light px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
          />
        </label>
        <label>
          <span className="text-sm font-medium text-primary">Ordem</span>
          <input
            name="sortOrder"
            type="number"
            min="0"
            defaultValue={item?.sortOrder ?? 0}
            disabled={disabled}
            className="mt-2 w-full rounded-2xl border border-gold/30 bg-cream-light px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-medium text-primary">Resposta</span>
        <textarea
          name="answer"
          defaultValue={item?.answer ?? ""}
          rows={4}
          required
          disabled={disabled}
          className="mt-2 w-full rounded-2xl border border-gold/30 bg-cream-light px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
        />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm text-dark/70">
        <input
          name="active"
          type="checkbox"
          defaultChecked={item?.active ?? true}
          disabled={disabled}
          className="h-4 w-4 rounded border-gold/40 text-primary focus:ring-primary disabled:opacity-50"
        />
        Exibir no site
      </label>
    </>
  );
}

export default function FaqItemForm({ items }: { items: FaqItem[] }) {
  const [isPendingSeed, startSeedTransition] = useTransition();
  const [isPendingNew, startNewTransition] = useTransition();
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"save" | "toggle" | "delete" | null>(null);
  const [isPendingAction, startActionTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const newFormRef = useRef<HTMLFormElement>(null);

  const handleSeed = () => {
    setNotification(null);
    startSeedTransition(async () => {
      try {
        await seedDefaultFaqItems();
        setNotification({ type: "success", text: "Perguntas frequentes padrão carregadas!" });
      } catch (err: any) {
        setNotification({ type: "error", text: err.message || "Erro ao carregar FAQs padrão." });
      }
    });
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotification(null);
    const formData = new FormData(e.currentTarget);
    startNewTransition(async () => {
      try {
        await saveFaqItem(formData);
        setNotification({ type: "success", text: "Pergunta adicionada com sucesso!" });
        newFormRef.current?.reset();
      } catch (err: any) {
        setNotification({ type: "error", text: err.message || "Erro ao adicionar FAQ." });
      }
    });
  };

  const handleFaqAction = (
    e: React.FormEvent<HTMLFormElement>,
    id: string,
    type: "save" | "toggle" | "delete",
    activeState?: boolean
  ) => {
    e.preventDefault();
    setNotification(null);
    setActiveFaqId(id);
    setActionType(type);

    const formData = new FormData(e.currentTarget);

    startActionTransition(async () => {
      try {
        if (type === "save") {
          await saveFaqItem(formData);
          setNotification({ type: "success", text: "Pergunta atualizada!" });
        } else if (type === "toggle") {
          await toggleFaqItem(id, !activeState);
          setNotification({ type: "success", text: activeState ? "Pergunta oculta!" : "Pergunta exibida!" });
        } else if (type === "delete") {
          if (confirm("Tem certeza que deseja excluir esta pergunta?")) {
            await deleteFaqItem(id);
            setNotification({ type: "success", text: "Pergunta excluída com sucesso!" });
          }
        }
      } catch (err: any) {
        setNotification({ type: "error", text: err.message || "Falha na operação." });
      } finally {
        setActiveFaqId(null);
        setActionType(null);
      }
    });
  };

  return (
    <section className="rounded-3xl border border-gold/25 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-primary">FAQ</h2>
          <p className="mt-1 text-sm text-dark/60">
            Gerencie perguntas frequentes exibidas em `/faq`. Se não houver itens cadastrados,
            o site usa respostas padrão.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={handleSeed}
            disabled={isPendingSeed}
            className="rounded-full border border-gold/35 px-4 py-2 text-sm font-medium text-primary transition hover:bg-gold/10 disabled:opacity-50"
          >
            {isPendingSeed ? "Carregando..." : "Carregar FAQ padrão"}
          </button>
        </div>
      </div>

      {notification && (
        <div className={`mt-4 p-4 rounded-xl border text-sm ${
          notification.type === "success" 
            ? "bg-forest/10 border-forest/30 text-forest-dark" 
            : "bg-fox/10 border-fox/30 text-fox-dark"
        }`}>
          {notification.text}
        </div>
      )}

      <form ref={newFormRef} onSubmit={handleCreate} className="mt-6 rounded-2xl border border-primary/10 bg-cream-warm p-4">
        <h3 className="font-serif text-xl text-primary">Nova pergunta</h3>
        <div className="mt-4">
          <FaqFields disabled={isPendingNew} />
        </div>
        <button type="submit" disabled={isPendingNew} className="btn-primary mt-4 disabled:opacity-50">
          {isPendingNew ? "Adicionando..." : "Adicionar FAQ"}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/40 bg-cream-light p-6 text-sm text-dark/60">
            Nenhum FAQ cadastrado no banco ainda. Use o botão acima para carregar os padrões.
          </div>
        ) : (
          items.map((item) => {
            const isTarget = activeFaqId === item.id;
            const isDisabled = isPendingAction && isTarget;

            return (
              <form
                key={item.id}
                onSubmit={(e) => handleFaqAction(e, item.id, "save")}
                className="rounded-2xl border border-gold/20 bg-cream-light p-4"
              >
                <FaqFields item={item} disabled={isPendingAction && isTarget} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={isPendingAction}
                    className="btn-primary disabled:opacity-50"
                  >
                    {isDisabled && actionType === "save" ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    type="button"
                    disabled={isPendingAction}
                    onClick={(e) => handleFaqAction(e as any, item.id, "toggle", item.active)}
                    className="rounded-full border border-gold/35 px-4 py-2 text-sm font-medium text-primary transition hover:bg-gold/10 disabled:opacity-50"
                  >
                    {isDisabled && actionType === "toggle"
                      ? "Processando..."
                      : item.active
                      ? "Ocultar"
                      : "Exibir"}
                  </button>
                  <button
                    type="button"
                    disabled={isPendingAction}
                    onClick={(e) => handleFaqAction(e as any, item.id, "delete")}
                    className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {isDisabled && actionType === "delete" ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </form>
            );
          })
        )}
      </div>
    </section>
  );
}
