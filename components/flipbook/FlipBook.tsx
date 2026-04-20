"use client";

import { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { FlipPage, FlipPageHard, SAMPLE_PAGES } from "./FlipBookPages";

type HTMLFlipBookApi = {
  flipPrev: () => void;
  flipNext: () => void;
};

type PageFlipInstance = {
  pageFlip(): HTMLFlipBookApi;
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handle = () => setIsMobile(mq.matches);
    handle();
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, [breakpoint]);
  return isMobile;
}

export default function FlipBook() {
  const bookRef = useRef<PageFlipInstance | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const isMobile = useIsMobile();

  const width = isMobile ? 320 : 420;
  const height = isMobile ? 440 : 560;
  const totalPages = SAMPLE_PAGES.length;

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative" style={{ perspective: "2000px" }}>
        <HTMLFlipBook
          ref={bookRef as never}
          width={width}
          height={height}
          size="stretch"
          minWidth={280}
          maxWidth={520}
          minHeight={380}
          maxHeight={640}
          maxShadowOpacity={0.4}
          showCover={true}
          mobileScrollSupport={true}
          usePortrait={isMobile}
          drawShadow
          flippingTime={600}
          className="shadow-2xl rounded-lg overflow-hidden"
          style={{}}
          startPage={0}
          startZIndex={0}
          autoSize={false}
          useMouseEvents
          swipeDistance={30}
          clickEventForward
          showPageCorners
          disableFlipByClick={false}
          onFlip={(e: { data: number }) => setCurrentPage(e.data)}
        >
          {SAMPLE_PAGES.map((page, i) =>
            page.kind === "hard" ? (
              <FlipPageHard key={i} bg={page.bg}>
                {page.content}
              </FlipPageHard>
            ) : (
              <FlipPage key={i} bg={page.bg}>
                {page.content}
              </FlipPage>
            ),
          )}
        </HTMLFlipBook>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip().flipPrev()}
          aria-label="Página anterior"
          className="w-10 h-10 rounded-full bg-white border-2 border-primary/20 hover:border-primary transition flex items-center justify-center"
        >
          ←
        </button>
        <span className="text-sm text-dark/60 font-medium min-w-[70px] text-center">
          {Math.min(currentPage + 1, totalPages)} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => bookRef.current?.pageFlip().flipNext()}
          aria-label="Próxima página"
          className="w-10 h-10 rounded-full bg-white border-2 border-primary/20 hover:border-primary transition flex items-center justify-center"
        >
          →
        </button>
      </div>
    </div>
  );
}
