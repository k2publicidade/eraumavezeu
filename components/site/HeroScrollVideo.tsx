"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const progressRef = useRef(0);
  const currentTimeRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.readyState >= 1) setIsLoaded(true);
    sectionRef.current = video.closest("section");

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollRange = sectionRef.current ? sectionRef.current.offsetHeight : 800;
      const progress = Math.min(Math.max(scrollY / scrollRange, 0), 1);
      progressRef.current = progress;
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrameId: number | null = null;
    let isVisible = false;

    const updateVideoTime = () => {
      if (!isVisible || motionQuery.matches) {
        animationFrameId = null;
        return;
      }

      const duration = video.duration;
      const validDuration = duration && Number.isFinite(duration) ? duration : 3;
      const targetTime = progressRef.current * (validDuration - 0.02);
      currentTimeRef.current += (targetTime - currentTimeRef.current) * 0.15;

      const delta = Math.abs(currentTimeRef.current - video.currentTime);
      if (video.readyState >= 1 && !video.seeking && delta > 0.015) {
        try {
          video.currentTime = Math.min(
            Math.max(currentTimeRef.current, 0),
            validDuration - 0.02,
          );
        } catch {
          // Some browsers temporarily reject seeks while metadata settles.
        }
      }

      animationFrameId = requestAnimationFrame(updateVideoTime);
    };

    const startAnimation = () => {
      if (!isVisible || motionQuery.matches || animationFrameId !== null) return;
      animationFrameId = requestAnimationFrame(updateVideoTime);
    };

    const stopAnimation = () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          handleScroll();
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { rootMargin: "120px 0px", threshold: 0.01 },
    );

    const handleMotionPreference = () => {
      if (motionQuery.matches) stopAnimation();
      else startAnimation();
    };

    observer.observe(video);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    motionQuery.addEventListener("change", handleMotionPreference);
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      motionQuery.removeEventListener("change", handleMotionPreference);
      stopAnimation();
    };
  }, []);

  const handleVideoLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
      {/* Video element as full background backdrop */}
      <video
        ref={videoRef}
        src="/bg_hero.webm"
        preload="metadata"
        muted
        playsInline
        webkit-playsinline="true"
        onLoadedMetadata={handleVideoLoad}
        onLoadedData={handleVideoLoad}
        onCanPlay={handleVideoLoad}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Loader placeholder overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-cream-warm flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3px] border-gold/20 border-t-primary animate-spin" />
          <p className="text-xs text-primary/75 font-semibold tracking-wide">
            Carregando cenário mágico...
          </p>
        </div>
      )}
    </div>
  );
}
