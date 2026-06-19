"use client";

import { useEffect, useState } from "react";

type Star = {
  id: number;
  left: string;
  top: string;
  size: string;
  delay: string;
  duration: string;
};

export default function MagicStars({ count = 30 }: { count?: number }) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generated: Star[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${1.5 + Math.random() * 2.5}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${4 + Math.random() * 4}s`,
    }));
    setStars(generated);
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-gold opacity-0 shadow-[0_0_8px_1.5px_rgba(212,168,67,0.75)] animate-twinkle-drift"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
}
