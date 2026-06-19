"use client";

import { useState, useTransition } from "react";
import { updateSiteSettings } from "@/app/actions/admin-content";
import { SITE_SETTING_FIELDS, type SiteSettings } from "@/lib/site-content";

export default function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotification(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateSiteSettings(formData);
        setNotification({ type: "success", text: "Configurações atualizadas com sucesso!" });
      } catch (err: any) {
        setNotification({ type: "error", text: err.message || "Falha ao salvar as configurações." });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-gold/25 bg-white p-6 shadow-sm relative">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-primary">Configurações do site</h2>
          <p className="mt-1 text-sm text-dark/60">
            Edite contatos, redes sociais e textos principais exibidos no site público.
          </p>
        </div>
        <button type="submit" disabled={isPending} className="btn-primary shrink-0 disabled:opacity-50">
          {isPending ? "Salvando..." : "Salvar configurações"}
        </button>
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

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {SITE_SETTING_FIELDS.map((field) => {
          const value = settings[field.key];
          const inputClass =
            "mt-2 w-full rounded-2xl border border-gold/30 bg-cream-light px-4 py-3 text-sm text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50";

          return (
            <label
              key={field.key}
              className={field.type === "textarea" ? "lg:col-span-2" : undefined}
            >
              <span className="text-sm font-medium text-primary">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea name={field.key} defaultValue={value} rows={3} className={inputClass} disabled={isPending} />
              ) : (
                <input name={field.key} type={field.type} defaultValue={value} className={inputClass} disabled={isPending} />
              )}
              {field.help && <span className="mt-1 block text-xs text-dark/45">{field.help}</span>}
            </label>
          );
        })}
      </div>
    </form>
  );
}
