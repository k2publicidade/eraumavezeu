"use client";

import InteractiveBook from "./InteractiveBook";

export default function ProductGallery() {
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Active Display */}
      <div className="bg-[#FCFAF7] border border-cream-deep/25 rounded-[24px] p-3 sm:p-4 shadow-premium relative min-h-[320px] sm:min-h-[370px] flex items-center justify-center overflow-hidden">
        {/* Book spine decoration background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#FAF7F2_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="w-full flex justify-center animate-fade-in py-2">
          <InteractiveBook />
        </div>
      </div>
    </div>
  );
}
