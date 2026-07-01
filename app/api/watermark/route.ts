import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DIMENSION = 1200;
const WATERMARK_TEXT = "ERA UMA VEZ EU";

/**
 * GET /api/watermark?url=<uploadthing-url>
 *
 * Resize + watermark + return JPEG stream. Usado para previews públicos
 * de fotos que originalmente estão em bucket privado.
 *
 * LGPD: sempre aplica marca d'água antes de servir foto de criança.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");
  if (!imageUrl) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(imageUrl);
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
  if (!upstream.ok) {
    return NextResponse.json(
      { error: "source unavailable" },
      { status: upstream.status },
    );
  }
  const buf = Buffer.from(await upstream.arrayBuffer());

  const meta = await sharp(buf).metadata();
  let w = meta.width ?? MAX_DIMENSION;
  let h = meta.height ?? MAX_DIMENSION;

  // Considere a orientação EXIF (se rotacionado 90/270 graus, inverte largura e altura)
  const orientation = meta.orientation ?? 1;
  if (orientation >= 5 && orientation <= 8) {
    const tmp = w;
    w = h;
    h = tmp;
  }

  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  const tileSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <pattern id="wm" width="260" height="140" patternUnits="userSpaceOnUse" patternTransform="rotate(-25)">
          <text x="0" y="90" fill="rgba(255,255,255,0.35)" font-family="sans-serif" font-size="24" font-weight="700" letter-spacing="2">
            ${WATERMARK_TEXT}
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wm)"/>
    </svg>`,
  );

  const final = await sharp(buf)
    .rotate()
    .resize({
      width: w,
      height: h,
      fit: "inside",
      withoutEnlargement: true,
    })
    .composite([{ input: tileSvg, blend: "over" }])
    .jpeg({ quality: 82 })
    .toBuffer();

  return new NextResponse(new Uint8Array(final), {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=900",
    },
  });
}
