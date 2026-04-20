"use client";

import { WIZARD_STEPS } from "@/lib/wizard/types";

export default function WizardProgress({ current }: { current: number }) {
  const percent = (current / WIZARD_STEPS.length) * 100;
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-dark/60 mb-2">
        <span>
          Passo {current} de {WIZARD_STEPS.length}
        </span>
        <span>{WIZARD_STEPS[current - 1]?.title}</span>
      </div>
      <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
