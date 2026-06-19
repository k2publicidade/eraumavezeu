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
    
    // Check if the video is already loaded or has metadata (e.g. from cache)
    if (video && video.readyState >= 1) {
      setIsLoaded(true);
    }

    if (video) {
      sectionRef.current = video.closest("section");
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Calculate dynamic scroll range based on the section's actual height
      // This maps the animation progress perfectly to the visibility window of the Hero banner
      const scrollRange = sectionRef.current ? sectionRef.current.offsetHeight : 800;
      const progress = Math.min(Math.max(scrollY / scrollRange, 0), 1);
      progressRef.current = progress;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    // Initial check
    handleScroll();

    let animationFrameId: number;

    const updateVideoTime = () => {
      const currentVideo = videoRef.current;
      if (currentVideo) {
        // Automatically mark as loaded if the video readyState is active
        if (currentVideo.readyState >= 1) {
          setIsLoaded(true);
          
          const duration = currentVideo.duration;
          const validDuration = (duration && isFinite(duration) && !isNaN(duration)) ? duration : 3.0;
          
          // Subtract a tiny fraction to avoid seeking beyond the duration
          const targetTime = progressRef.current * (validDuration - 0.02);

          // Smoothly interpolate current time to target time (lerp factor: 0.15 for snappier feedback)
          currentTimeRef.current = currentTimeRef.current + (targetTime - currentTimeRef.current) * 0.15;

          // Prevent decoder thrashing by only seeking if the browser has finished the previous seek
          // and there is a meaningful time difference to apply.
          const delta = Math.abs(currentTimeRef.current - currentVideo.currentTime);
          if (!currentVideo.seeking && delta > 0.015) {
            try {
              currentVideo.currentTime = Math.min(Math.max(currentTimeRef.current, 0), validDuration - 0.02);
            } catch (e) {
              // Prevent crashes on initial load if seeking is temporarily unavailable
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(updateVideoTime);
    };

    animationFrameId = requestAnimationFrame(updateVideoTime);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(animationFrameId);
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
        preload="auto"
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
        <div className="absolute inset-0 bg-[#FFF8E8] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3px] border-gold/20 border-t-primary animate-spin" />
          <p className="text-[11px] text-primary/70 font-semibold tracking-wide uppercase">
            Carregando cenário mágico...
          </p>
        </div>
      )}
    </div>
  );
}
