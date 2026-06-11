"use client";

// ============================================================
// Cena Three.js da prévia do livro — Canvas + luzes warm da
// marca + sombra de contato + órbita limitada (sem zoom/pan).
// Carregado com dynamic + ssr:false para não inflar o bundle
// inicial do wizard.
// ============================================================

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import BookModel, { type BookModelProps } from "./BookModel";

type Book3DProps = Omit<BookModelProps, "reducedMotion">;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export default function Book3D(props: Book3DProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Canvas
      dpr={[1, 2]}
      // com reduced-motion não há animação contínua — renderiza só quando algo muda
      frameloop={reducedMotion ? "demand" : "always"}
      camera={{ position: [0, 0.25, 8.4], fov: 33 }}
      gl={{ antialias: true, alpha: true }}
      // permite scroll vertical da página no mobile; arrastar na horizontal gira o livro
      style={{ touchAction: "pan-y" }}
      aria-label="Prévia 3D do livro personalizado"
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 5]} intensity={1.3} />
      {/* luz de preenchimento dourada — clima de luz de vela da marca */}
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#F5D87E" />

      <BookModel {...props} reducedMotion={reducedMotion} />

      <ContactShadows
        position={[0, -2.35, 0]}
        opacity={0.35}
        scale={10}
        blur={2.5}
        far={4.5}
        color="#1E3A5F"
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2 - 0.55}
        maxPolarAngle={Math.PI / 2 + 0.3}
        rotateSpeed={0.7}
      />
    </Canvas>
  );
}
