"use client";

import { useEffect, useState } from "react";

export default function FloatingMagicElements() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* 1. Magic Sparkle (Top Left) */}
      <div 
        className="absolute top-[15%] left-[8%] text-gold/20 w-8 h-8 md:w-10 md:h-10 animate-float"
        style={{ animationDuration: "5s", animationDelay: "0s" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full">
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 15.6l2.8-2.8M15.6 5.6l2.8-2.8" strokeLinecap="round" />
        </svg>
      </div>

      {/* 2. Magic Book (Middle Right) */}
      <div 
        className="absolute top-[40%] right-[10%] text-gold/15 w-10 h-10 md:w-12 md:h-12 animate-float hidden sm:block"
        style={{ animationDuration: "7s", animationDelay: "1s" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V5A2.5 2.5 0 0 1 6.5 2.5H20v14H6.5a2.5 2.5 0 0 0-2.5 2.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 3. Crescent Moon (Bottom Left) */}
      <div 
        className="absolute bottom-[20%] left-[12%] text-gold/15 w-9 h-9 md:w-11 md:h-11 animate-float"
        style={{ animationDuration: "6s", animationDelay: "2s" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full">
          <path d="M12 3a9 9 0 1 0 9 9 9.75 9.75 0 0 0-.67-3.4A6.75 6.75 0 0 1 12 3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 4. Golden Key of Secrets (Top Right) */}
      <div 
        className="absolute top-[22%] right-[15%] text-gold/20 w-8 h-8 md:w-9 md:h-9 animate-float"
        style={{ animationDuration: "8s", animationDelay: "0.5s" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l1.5 1.5M15.5 7.5L17 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 5. Small Magic Sparkle Star (Bottom Right) */}
      <div 
        className="absolute bottom-[25%] right-[25%] text-gold/15 w-6 h-6 md:w-8 md:h-8 animate-float hidden md:block"
        style={{ animationDuration: "5.5s", animationDelay: "3s" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-full h-full">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
