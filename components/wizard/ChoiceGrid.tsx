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
            className={`relative p-5 rounded-2xl border-2 transition-all duration-200 text-left group
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              ${
                isActive
                  ? "border-gold bg-primary/5 shadow-md ring-1 ring-gold/40"
                  : "border-gold/20 bg-cream-light hover:border-gold/50 hover:bg-cream-warm hover:shadow-sm"
              }`}
          >
            {/* Checkmark quando selecionado */}
            {isActive && (
              <span
                className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm"
                aria-hidden="true"
              >
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4l2.5 2.5L9 1"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
            {opt.hex && (
              <span
                aria-hidden
                className="block w-8 h-8 rounded-full mb-3 ring-2 ring-white shadow-sm"
                style={{ backgroundColor: opt.hex }}
              />
            )}
            <span
              className={`font-serif text-lg transition-colors duration-200 ${
                isActive ? "text-primary" : "text-dark/80 group-hover:text-primary"
              }`}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
