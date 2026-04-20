"use client";

import { WIZARD_STEPS } from "@/lib/wizard/types";

export default function WizardProgress({ current }: { current: number }) {
  const percent = (current / WIZARD_STEPS.length) * 100;
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-dark/55 mb-2 font-medium">
        <span className="text-primary/70">
          Passo {current} de {WIZARD_STEPS.length}
        </span>
        <span className="text-dark/50">{WIZARD_STEPS[current - 1]?.title}</span>
      </div>
      {/* Barra de progresso com gradiente dourado */}
      <div
        className="h-2 bg-gold/15 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={WIZARD_STEPS.length}
        aria-label={`Passo ${current} de ${WIZARD_STEPS.length}`}
      >
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-350 ease-book"
          style={{ width: `${percent}%` }}
        />
      </div>
      {/* Dots dos passos */}
      <div className="flex justify-between mt-2" aria-hidden="true">
        {WIZARD_STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-250 ${
              i + 1 <= current ? "bg-primary" : "bg-gold/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
