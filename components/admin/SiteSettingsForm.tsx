import { updateSiteSettings } from "@/app/actions/admin-content";
import { SITE_SETTING_FIELDS, type SiteSettings } from "@/lib/site-content";

export default function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  return (
    <form action={updateSiteSettings} className="rounded-3xl border border-gold/25 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-primary">Configurações do site</h2>
          <p className="mt-1 text-sm text-dark/60">
            Edite contatos, redes sociais e textos principais exibidos no site público.
          </p>
        </div>
        <button type="submit" className="btn-primary shrink-0">
          Salvar configurações
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {SITE_SETTING_FIELDS.map((field) => {
          const value = settings[field.key];
          const inputClass =
            "mt-2 w-full rounded-2xl border border-gold/30 bg-cream-light px-4 py-3 text-sm text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

          return (
            <label
              key={field.key}
              className={field.type === "textarea" ? "lg:col-span-2" : undefined}
            >
              <span className="text-sm font-medium text-primary">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea name={field.key} defaultValue={value} rows={3} className={inputClass} />
              ) : (
                <input name={field.key} type={field.type} defaultValue={value} className={inputClass} />
              )}
              {field.help && <span className="mt-1 block text-xs text-dark/45">{field.help}</span>}
            </label>
          );
        })}
      </div>
    </form>
  );
}
