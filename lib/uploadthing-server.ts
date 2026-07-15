import { UTApi } from "uploadthing/server";
import {
  decodePrivatePhotoKey,
  deletePrivatePhotoFiles,
  getPrivatePhotoSignedUrl,
} from "@/lib/private-photo-storage";

/**
 * Signed URLs de curta duração para as fotos do bucket privado (LGPD —
 * URLs não-listadas com expiração). Usado pelo painel admin.
 */

const SIGNED_URL_TTL_SECONDS = 900; // 15 min

let utapi: UTApi | null = null;

function getUtApi(): UTApi {
  if (!utapi) {
    utapi = new UTApi({
      token: process.env.UPLOADTHING_TOKEN,
    });
  }
  return utapi;
}

export type SignedPhoto = {
  key: string;
  /** null quando o Uploadthing não está configurado ou a key não existe */
  url: string | null;
};

/** Exclusão definitiva no storage — usada pelo cron de retenção LGPD. */
export async function deletePhotoFiles(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const privateKeys = keys.filter((key) => decodePrivatePhotoKey(key));
  const legacyKeys = keys.filter((key) => !decodePrivatePhotoKey(key));
  await Promise.all([
    deletePrivatePhotoFiles(privateKeys),
    legacyKeys.length > 0 ? getUtApi().deleteFiles(legacyKeys) : Promise.resolve(),
  ]);
}

export async function getSignedPhotoUrls(
  keys: string[],
): Promise<SignedPhoto[]> {
  return Promise.all(
    keys.map(async (key) => {
      try {
        if (decodePrivatePhotoKey(key)) {
          return { key, url: await getPrivatePhotoSignedUrl(key, SIGNED_URL_TTL_SECONDS) };
        }
        const { ufsUrl } = await getUtApi().generateSignedURL(key, {
          expiresIn: SIGNED_URL_TTL_SECONDS,
        });
        return { key, url: ufsUrl };
      } catch (err) {
        console.error(`[uploadthing] signed URL falhou para ${key}`, err);
        return { key, url: null };
      }
    }),
  );
}
