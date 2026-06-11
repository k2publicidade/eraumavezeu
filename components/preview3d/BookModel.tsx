"use client";

// ============================================================
// Modelo 3D do livro de capa dura — geometria procedural
// (capas + lombada + miolo) com texturas canvas de coverArt.ts.
// A capa frontal abre revelando a página de dedicatória.
// ============================================================

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  CREAM,
  drawBackCover,
  drawCover,
  drawDedicationPage,
  drawPageEdges,
  drawSpine,
  resolveCoverColor,
  shade,
} from "./coverArt";

// Dimensões em unidades de cena (proporção de um livro 21×27,5cm)
const COVER_W = 3.1;
const COVER_H = 4.05;
const COVER_T = 0.09;
const PAGE_W = 2.95;
const PAGE_H = 3.86;
const PAGE_T = 0.5;

const OPEN_ANGLE = -2.35; // ~135° — capa aberta sem esconder a página

export type BookModelProps = {
  colorSlug: string | null;
  themeSlug: string | null;
  childName: string;
  dedication: string;
  open: boolean;
  reducedMotion: boolean;
  onToggle: () => void;
};

/** Converte um canvas em textura sRGB com dispose automático. */
function useCanvasTexture(draw: () => HTMLCanvasElement, deps: readonly unknown[]): THREE.CanvasTexture {
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(draw());
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

export default function BookModel({
  colorSlug,
  themeSlug,
  childName,
  dedication,
  open,
  reducedMotion,
  onToggle,
}: BookModelProps) {
  const bookRef = useRef<THREE.Group>(null);
  const frontRef = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);

  const coverTex = useCanvasTexture(
    () => drawCover({ colorSlug, themeSlug, childName }),
    [colorSlug, themeSlug, childName],
  );
  const backTex = useCanvasTexture(
    () => drawBackCover({ colorSlug, themeSlug, childName }),
    [colorSlug],
  );
  const spineTex = useCanvasTexture(
    () => drawSpine({ colorSlug, themeSlug, childName }),
    [colorSlug, childName],
  );
  const dedicationTex = useCanvasTexture(
    () => drawDedicationPage({ colorSlug, themeSlug, childName, dedication }),
    [childName, dedication],
  );
  const edgesTex = useCanvasTexture(() => drawPageEdges(), []);

  const baseColor = resolveCoverColor(colorSlug);
  const edgeColor = shade(baseColor, -0.35);
  const innerColor = CREAM;

  // em frameloop="demand" (reduced-motion) o frame só roda quando invalidado
  useEffect(() => {
    invalidate();
  }, [invalidate, open, coverTex, backTex, spineTex, dedicationTex]);

  useFrame((state, delta) => {
    const book = bookRef.current;
    const front = frontRef.current;
    if (!book || !front) return;
    const t = state.clock.elapsedTime;

    // reduced-motion: sem animação — aplica o estado final direto no frame
    if (reducedMotion) {
      front.rotation.y = open ? OPEN_ANGLE : 0;
      book.scale.setScalar(open ? 0.78 : 1);
      book.position.x = open ? 0.55 : 0;
      book.position.y = 0;
      book.rotation.y = open ? 0.15 : 0.42;
      book.rotation.x = -0.06;
      return;
    }

    // abertura da capa com amortecimento suave
    front.rotation.y = THREE.MathUtils.damp(front.rotation.y, open ? OPEN_ANGLE : 0, 4, delta);

    // aberto, o livro recua e centraliza para caber no enquadramento
    const targetScale = open ? 0.78 : 1;
    book.scale.setScalar(THREE.MathUtils.damp(book.scale.x, targetScale, 3.5, delta));
    book.position.x = THREE.MathUtils.damp(book.position.x, open ? 0.55 : 0, 3.5, delta);

    // flutuação e balanço sutis
    const sway = Math.sin(t * 0.45) * 0.12;
    const baseRotY = open ? 0.15 : 0.42;
    book.rotation.y = THREE.MathUtils.damp(book.rotation.y, baseRotY + sway, 2.5, delta);
    book.rotation.x = -0.06;
    book.position.y = Math.sin(t * 0.8) * 0.07;
  });

  return (
    <group
      ref={bookRef}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {/* contracapa */}
      <mesh position={[0, 0, -(PAGE_T / 2 + COVER_T / 2)]}>
        <boxGeometry args={[COVER_W, COVER_H, COVER_T]} />
        <meshStandardMaterial attach="material-0" color={edgeColor} roughness={0.5} />
        <meshStandardMaterial attach="material-1" color={edgeColor} roughness={0.5} />
        <meshStandardMaterial attach="material-2" color={edgeColor} roughness={0.5} />
        <meshStandardMaterial attach="material-3" color={edgeColor} roughness={0.5} />
        <meshStandardMaterial attach="material-4" color={innerColor} roughness={0.7} />
        <meshStandardMaterial attach="material-5" map={backTex} roughness={0.45} metalness={0.05} />
      </mesh>

      {/* lombada */}
      <mesh position={[-(COVER_W / 2 + COVER_T / 2), 0, 0]}>
        <boxGeometry args={[COVER_T, COVER_H, PAGE_T + COVER_T * 2]} />
        <meshStandardMaterial attach="material-0" color={edgeColor} roughness={0.5} />
        <meshStandardMaterial attach="material-1" map={spineTex} roughness={0.45} metalness={0.05} />
        <meshStandardMaterial attach="material-2" color={edgeColor} roughness={0.5} />
        <meshStandardMaterial attach="material-3" color={edgeColor} roughness={0.5} />
        <meshStandardMaterial attach="material-4" color={edgeColor} roughness={0.5} />
        <meshStandardMaterial attach="material-5" color={edgeColor} roughness={0.5} />
      </mesh>

      {/* miolo de páginas */}
      <mesh position={[0.05, 0, 0]}>
        <boxGeometry args={[PAGE_W, PAGE_H, PAGE_T]} />
        <meshStandardMaterial attach="material-0" map={edgesTex} roughness={0.9} />
        <meshStandardMaterial attach="material-1" color={CREAM} roughness={0.9} />
        <meshStandardMaterial attach="material-2" map={edgesTex} roughness={0.9} />
        <meshStandardMaterial attach="material-3" map={edgesTex} roughness={0.9} />
        <meshStandardMaterial attach="material-4" color={CREAM} roughness={0.9} />
        <meshStandardMaterial attach="material-5" color={CREAM} roughness={0.9} />
      </mesh>

      {/* página de dedicatória — primeira folha do miolo */}
      <mesh position={[0.05, 0, PAGE_T / 2 + 0.004]}>
        <planeGeometry args={[PAGE_W - 0.04, PAGE_H - 0.04]} />
        <meshStandardMaterial map={dedicationTex} roughness={0.9} />
      </mesh>

      {/* capa frontal — pivô na lombada para a animação de abrir */}
      <group ref={frontRef} position={[-COVER_W / 2, 0, PAGE_T / 2 + COVER_T / 2]}>
        <mesh position={[COVER_W / 2, 0, 0]}>
          <boxGeometry args={[COVER_W, COVER_H, COVER_T]} />
          <meshStandardMaterial attach="material-0" color={edgeColor} roughness={0.5} />
          <meshStandardMaterial attach="material-1" color={edgeColor} roughness={0.5} />
          <meshStandardMaterial attach="material-2" color={edgeColor} roughness={0.5} />
          <meshStandardMaterial attach="material-3" color={edgeColor} roughness={0.5} />
          <meshStandardMaterial attach="material-4" map={coverTex} roughness={0.45} metalness={0.05} />
          <meshStandardMaterial attach="material-5" color={innerColor} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
