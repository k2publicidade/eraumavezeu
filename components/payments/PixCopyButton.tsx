"use client";

import { useState } from "react";

interface PixCopyButtonProps {
  code: string;
}

export function PixCopyButton({ code }: PixCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar código Pix:", err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        <input
          type="text"
          readOnly
          value={code}
          className="flex-1 px-4 py-3 bg-cream text-primary border border-gold/30 rounded-2xl text-xs font-mono select-all focus:outline-none focus:border-gold/60"
        />
        <button
          onClick={handleCopy}
          className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 whitespace-nowrap shadow-md ${
            copied
              ? "bg-forest text-cream shadow-forest/20"
              : "bg-gold text-primary hover:bg-gold-light shadow-gold/25"
          }`}
        >
          {copied ? (
            <span className="flex items-center justify-center gap-1.5">
              <span>Copiado!</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <span>Copiar Pix</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
