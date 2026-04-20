"use client";

type Option = {
  slug: string;
  label: string;
  hex?: string;
};

type Props<T extends string> = {
  options: readonly Option[];
  value: T | null;
  onChange: (slug: T) => void;
  columns?: 2 | 3;
};

export default function ChoiceGrid<T extends string>({
  options,
  value,
  onChange,
  columns = 3,
}: Props<T>) {
  const grid = columns === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3";
  return (
    <div className={`grid ${grid} gap-3`}>
      {options.map((opt) => {
        const isActive = value === opt.slug;
        return (
          <button
            key={opt.slug}
            type="button"
            onClick={() => onChange(opt.slug as T)}
            aria-pressed={isActive}
            className={`relative p-6 rounded-2xl border-2 transition text-left ${
              isActive
                ? "border-primary bg-primary/5 shadow"
                : "border-primary/15 bg-white hover:border-primary/40"
            }`}
          >
            {opt.hex && (
              <span
                aria-hidden
                className="block w-8 h-8 rounded-full mb-3"
                style={{ backgroundColor: opt.hex }}
              />
            )}
            <span className="font-serif text-lg text-dark">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
