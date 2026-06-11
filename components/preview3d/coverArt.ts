// ============================================================
// Arte procedural do livro 3D — texturas desenhadas em canvas 2D
// para refletir ao vivo as escolhas do wizard (cor, tema, nome,
// dedicatória) sem depender de assets externos.
// Roda apenas no client (document.createElement) — os componentes
// que consomem são carregados com dynamic + ssr:false.
// ============================================================

import { COLORS, THEMES } from "@/lib/wizard/types";

export const NAVY = "#1E3A5F";
export const GOLD = "#E8C94A";
export const GOLD_LIGHT = "#F5E08A";
export const CREAM = "#FAF3DC";
export const CREAM_LIGHT = "#FFFDF5";

// Motivos por tema — emoji renderiza bem em canvas e dispensa SVGs
const THEME_MOTIFS: Record<string, string> = {
  dinossauros: "🦖",
  floresta_encantada: "🦊",
  trem: "🚂",
  princesas: "👑",
  robos: "🤖",
};

export type CoverArtInput = {
  colorSlug: string | null;
  themeSlug: string | null;
  childName: string;
};

/** Escurece (amt < 0) ou clareia (amt > 0) uma cor hex. */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const target = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const mix = (c: number) => Math.round(c + (target - c) * p);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function resolveCoverColor(colorSlug: string | null): string {
  return COLORS.find((c) => c.slug === colorSlug)?.hex ?? NAVY;
}

function resolveThemeLabel(themeSlug: string | null): string | null {
  return THEMES.find((t) => t.slug === themeSlug)?.label ?? null;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d indisponível");
  return [canvas, ctx];
}

function serif(px: number, opts?: { bold?: boolean; italic?: boolean }): string {
  const style = opts?.italic ? "italic " : "";
  const weight = opts?.bold ? "700 " : "";
  return `${style}${weight}${px}px Georgia, 'Times New Roman', serif`;
}

/** Reduz o tamanho da fonte até o texto caber em maxWidth. */
function fitSerif(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  start: number,
  min: number,
  opts?: { bold?: boolean; italic?: boolean },
): number {
  let size = start;
  ctx.font = serif(size, opts);
  while (size > min && ctx.measureText(text).width > maxWidth) {
    size -= 4;
    ctx.font = serif(size, opts);
  }
  return size;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const probe = line ? `${line} ${word}` : word;
    if (ctx.measureText(probe).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = probe;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Estrelinha de 4 pontas, como as do selo da marca. */
function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
  ctx.restore();
}

// Posições fixas (frações de W/H) — determinístico, sem "pulo" entre renders
const COVER_STARS: ReadonlyArray<readonly [number, number, number]> = [
  [0.16, 0.1, 1],
  [0.84, 0.08, 0.8],
  [0.1, 0.33, 0.7],
  [0.9, 0.3, 1],
  [0.13, 0.62, 0.8],
  [0.88, 0.6, 0.7],
  [0.18, 0.88, 0.9],
  [0.82, 0.9, 1],
];

/** Capa frontal: gradiente na cor escolhida, moldura dourada, selo com motivo do tema e nome da criança. */
export function drawCover(input: CoverArtInput): HTMLCanvasElement {
  const W = 1024;
  const H = 1340;
  const [canvas, ctx] = makeCanvas(W, H);
  const base = resolveCoverColor(input.colorSlug);
  const themeLabel = resolveThemeLabel(input.themeSlug);
  const motif = THEME_MOTIFS[input.themeSlug ?? ""] ?? "📖";

  // fundo — gradiente vertical na cor favorita
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, shade(base, 0.12));
  grad.addColorStop(0.55, base);
  grad.addColorStop(1, shade(base, -0.3));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // vinheta sutil para profundidade
  const vig = ctx.createRadialGradient(W / 2, H * 0.42, 120, W / 2, H * 0.42, H * 0.8);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.20)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // moldura dupla dourada (eco do selo da marca)
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 8;
  ctx.strokeRect(44, 44, W - 88, H - 88);
  ctx.strokeStyle = GOLD_LIGHT;
  ctx.lineWidth = 2;
  ctx.strokeRect(68, 68, W - 136, H - 136);

  // estrelinhas espalhadas
  for (const [fx, fy, fr] of COVER_STARS) {
    drawSparkle(ctx, fx * W, fy * H, 14 * fr, GOLD_LIGHT, 0.85);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // eyebrow "ERA UMA VEZ" com espaçamento manual (letterSpacing não é universal em canvas)
  ctx.fillStyle = GOLD;
  ctx.font = serif(40);
  ctx.fillText("E R A   U M A   V E Z", W / 2, 235);

  // nome da criança — fonte ajustada para caber
  const name = input.childName.trim() || "Eu";
  fitSerif(ctx, name, W - 240, 150, 64, { bold: true });
  ctx.fillStyle = CREAM_LIGHT;
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  ctx.fillText(name, W / 2, 405);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // filete decorativo sob o nome
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 140, 455);
  ctx.lineTo(W / 2 + 140, 455);
  ctx.stroke();
  drawSparkle(ctx, W / 2, 455, 16, GOLD);

  // selo central em creme com o motivo do tema
  const cy = 810;
  const r = 265;
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.arc(W / 2, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(W / 2, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = shade(base, -0.15);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(W / 2, cy, r - 22, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = "280px serif";
  ctx.textBaseline = "middle";
  ctx.fillText(motif, W / 2, cy + 16);
  ctx.textBaseline = "alphabetic";

  // tema escolhido abaixo do selo
  ctx.fillStyle = GOLD_LIGHT;
  ctx.font = serif(42, { italic: true });
  ctx.fillText(themeLabel ?? "Uma história mágica", W / 2, 1175);

  // assinatura da marca
  ctx.fillStyle = "rgba(250,243,220,0.75)";
  ctx.font = serif(28);
  ctx.fillText("✦  era uma vez eu  ✦", W / 2, 1255);

  return canvas;
}

/** Lombada: cor escurecida, filetes dourados e título vertical. */
export function drawSpine(input: CoverArtInput): HTMLCanvasElement {
  const W = 128;
  const H = 1340;
  const [canvas, ctx] = makeCanvas(W, H);
  const base = resolveCoverColor(input.colorSlug);

  ctx.fillStyle = shade(base, -0.3);
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 5;
  for (const y of [54, 78, H - 78, H - 54]) {
    ctx.beginPath();
    ctx.moveTo(18, y);
    ctx.lineTo(W - 18, y);
    ctx.stroke();
  }

  const name = input.childName.trim() || "Era Uma Vez Eu";
  const title = `Era uma vez ${name}`;
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  fitSerif(ctx, title, H - 320, 56, 32, { bold: true });
  ctx.fillStyle = GOLD_LIGHT;
  ctx.fillText(title, 0, 0);
  ctx.restore();

  return canvas;
}

/** Contracapa: tom da capa com selo discreto da marca. */
export function drawBackCover(input: CoverArtInput): HTMLCanvasElement {
  const W = 1024;
  const H = 1340;
  const [canvas, ctx] = makeCanvas(W, H);
  const base = resolveCoverColor(input.colorSlug);

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, shade(base, 0.05));
  grad.addColorStop(1, shade(base, -0.3));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 6;
  ctx.strokeRect(44, 44, W - 88, H - 88);

  ctx.textAlign = "center";
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2 - 40, 110, 0, Math.PI * 2);
  ctx.stroke();
  drawSparkle(ctx, W / 2, H / 2 - 40, 42, GOLD);

  ctx.fillStyle = "rgba(250,243,220,0.85)";
  ctx.font = serif(34);
  ctx.fillText("era uma vez eu", W / 2, H / 2 + 160);
  ctx.fillStyle = "rgba(250,243,220,0.55)";
  ctx.font = serif(26, { italic: true });
  ctx.fillText("feito com amor, para durar gerações", W / 2, H / 2 + 215);

  return canvas;
}

/** Página de dedicatória — visível quando o livro abre. */
export function drawDedicationPage(input: CoverArtInput & { dedication: string }): HTMLCanvasElement {
  const W = 1024;
  const H = 1340;
  const [canvas, ctx] = makeCanvas(W, H);

  ctx.fillStyle = CREAM_LIGHT;
  ctx.fillRect(0, 0, W, H);

  // leve sombra junto à lombada, como um livro real
  const fold = ctx.createLinearGradient(0, 0, 90, 0);
  fold.addColorStop(0, "rgba(30,42,58,0.14)");
  fold.addColorStop(1, "rgba(30,42,58,0)");
  ctx.fillStyle = fold;
  ctx.fillRect(0, 0, 90, H);

  ctx.strokeStyle = "rgba(232,201,74,0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(70, 60, W - 140, H - 120);

  ctx.textAlign = "center";
  drawSparkle(ctx, W / 2, 230, 22, GOLD);

  const name = input.childName.trim() || "você";
  const text =
    input.dedication.trim() || `Para ${name}, que esta história seja só o começo da sua grande aventura.`;

  ctx.font = serif(52, { italic: true });
  const lines = wrapLines(ctx, text, W - 320).slice(0, 9);
  const lineHeight = 80;
  const blockTop = H / 2 - ((lines.length - 1) * lineHeight) / 2 - 40;
  ctx.fillStyle = NAVY;
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, blockTop + i * lineHeight);
  });

  drawSparkle(ctx, W / 2, H - 240, 22, GOLD);
  ctx.fillStyle = "rgba(30,42,58,0.4)";
  ctx.font = serif(26);
  ctx.fillText("— dedicatória —", W / 2, H - 150);

  return canvas;
}

/** Bordas das páginas (frente do miolo) — listras finas simulando folhas. */
export function drawPageEdges(): HTMLCanvasElement {
  const W = 64;
  const H = 512;
  const [canvas, ctx] = makeCanvas(W, H);
  ctx.fillStyle = "#F4ECD8";
  ctx.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 4) {
    ctx.fillStyle = y % 8 === 0 ? "rgba(30,42,58,0.10)" : "rgba(196,168,50,0.12)";
    ctx.fillRect(0, y, W, 1);
  }
  return canvas;
}
