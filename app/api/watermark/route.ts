import { NextResponse } from "next/server";
import sharp from "sharp";
import { getSignedPhotoUrls } from "@/lib/uploadthing-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DIMENSION = 1200;
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8_000;
const WATERMARK_TEXT = "ERA UMA VEZ EU";

const ALLOWED_IMAGE_HOSTS = ["utfs.io", "ufs.sh", "uploadthing.com"];

function isAllowedImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      ALLOWED_IMAGE_HOSTS.some(
        (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
      )
    );
  } catch {
    return false;
  }
}

/**
 * GET /api/watermark?key=<uploadthing-file-key>
 *
 * Resize + watermark + return JPEG stream. Usado para previews públicos
 * de fotos que originalmente estão em bucket privado.
 *
 * LGPD: sempre aplica marca d'água antes de servir foto de criança.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileKey = searchParams.get("key");
  if (!fileKey || !/^[A-Za-z0-9._~-]{8,300}$/.test(fileKey)) {
    return NextResponse.json({ error: "valid key required" }, { status: 400 });
  }

  const [signedPhoto] = await getSignedPhotoUrls([fileKey]);
  const imageUrl = signedPhoto?.url;
  if (!imageUrl) {
    return NextResponse.json({ error: "source unavailable" }, { status: 404 });
  }
  if (!isAllowedImageUrl(imageUrl)) {
    return NextResponse.json({ error: "source not allowed" }, { status: 502 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(imageUrl, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
  if (!upstream.ok) {
    return NextResponse.json(
      { error: "source unavailable" },
      { status: upstream.status },
    );
  }
  const contentType = upstream.headers.get("content-type") ?? "";
  const contentLength = Number(upstream.headers.get("content-length") ?? 0);
  if (!contentType.startsWith("image/") || contentLength > MAX_SOURCE_BYTES) {
    return NextResponse.json({ error: "invalid source" }, { status: 415 });
  }
  const buf = Buffer.from(await upstream.arrayBuffer());
  if (buf.byteLength > MAX_SOURCE_BYTES) {
    return NextResponse.json({ error: "source too large" }, { status: 413 });
  }

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
