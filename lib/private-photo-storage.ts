const PRIVATE_PHOTO_BUCKET = "child-photos";
const PRIVATE_PHOTO_PREFIX = "sb_";
const MAX_PRIVATE_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type UploadCandidate = { type: string; size: number };

export function validatePrivatePhotoUpload(file: UploadCandidate): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { ok: false, error: "Envie uma imagem JPG, PNG ou WEBP." };
  }
  if (!Number.isFinite(file.size) || file.size <= 0 || file.size > MAX_PRIVATE_PHOTO_BYTES) {
    return { ok: false, error: "Cada foto deve ter no máximo 8 MB." };
  }
  return { ok: true };
}

export function encodePrivatePhotoKey(path: string) {
  return `${PRIVATE_PHOTO_PREFIX}${Buffer.from(path, "utf8").toString("base64url")}`;
}

export function decodePrivatePhotoKey(key: string): string | null {
  if (!key.startsWith(PRIVATE_PHOTO_PREFIX)) return null;
  try {
    const path = Buffer.from(key.slice(PRIVATE_PHOTO_PREFIX.length), "base64url").toString("utf8");
    return path.startsWith("pending/") && !path.includes("..") ? path : null;
  } catch {
    return null;
  }
}

export function isAllowedPrivatePhotoUrl(value: string, supabaseProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const candidate = new URL(value);
    const supabaseHost = supabaseProjectUrl ? new URL(supabaseProjectUrl).hostname : "";
    const isLegacyUploadThing = ["utfs.io", "ufs.sh", "uploadthing.com"].some(
      (host) => candidate.hostname === host || candidate.hostname.endsWith(`.${host}`),
    );
    return candidate.protocol === "https:" && (isLegacyUploadThing || candidate.hostname === supabaseHost);
  } catch {
    return false;
  }
}

function storageConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Storage privado não configurado.");
  return { url, key };
}

function storageHeaders(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

function extensionFor(type: string) {
  return type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
}

export async function createPrivatePhotoUpload(file: UploadCandidate) {
  const validation = validatePrivatePhotoUpload(file);
  if (!validation.ok) throw new Error(validation.error);

  const { url, key } = storageConfig();
  const path = `pending/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extensionFor(file.type)}`;
  const response = await fetch(
    `${url}/storage/v1/object/upload/sign/${PRIVATE_PHOTO_BUCKET}/${path}`,
    { method: "POST", headers: storageHeaders(key), body: JSON.stringify({ allowOverwrite: false }) },
  );
  const data = (await response.json().catch(() => ({}))) as { token?: string; message?: string; error?: string };
  if (!response.ok || !data.token) {
    throw new Error(data.message || data.error || "Não foi possível preparar o envio da foto.");
  }

  return {
    fileKey: encodePrivatePhotoKey(path),
    uploadUrl: `${url}/storage/v1/object/upload/sign/${PRIVATE_PHOTO_BUCKET}/${path}?token=${encodeURIComponent(data.token)}`,
  };
}

export async function getPrivatePhotoSignedUrl(keyValue: string, expiresIn = 900) {
  const path = decodePrivatePhotoKey(keyValue);
  if (!path) return null;
  const { url, key } = storageConfig();
  const response = await fetch(`${url}/storage/v1/object/sign/${PRIVATE_PHOTO_BUCKET}/${path}`, {
    method: "POST",
    headers: storageHeaders(key),
    body: JSON.stringify({ expiresIn }),
  });
  const data = (await response.json().catch(() => ({}))) as { signedURL?: string };
  if (!response.ok || !data.signedURL) return null;
  return data.signedURL.startsWith("http") ? data.signedURL : `${url}/storage/v1${data.signedURL}`;
}

export async function deletePrivatePhotoFiles(keys: string[]) {
  const paths = keys.map(decodePrivatePhotoKey).filter((path): path is string => Boolean(path));
  if (paths.length === 0) return;
  const { url, key } = storageConfig();
  const response = await fetch(`${url}/storage/v1/object/${PRIVATE_PHOTO_BUCKET}`, {
    method: "DELETE",
    headers: storageHeaders(key),
    body: JSON.stringify({ prefixes: paths }),
  });
  if (!response.ok) throw new Error("Não foi possível excluir fotos privadas expiradas.");
}
