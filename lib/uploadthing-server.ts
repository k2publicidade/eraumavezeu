import { UTApi } from "uploadthing/server";

/**
 * Signed URLs de curta duração para as fotos do bucket privado (LGPD —
 * URLs não-listadas com expiração). Usado pelo painel admin.
 */

const SIGNED_URL_TTL_SECONDS = 900; // 15 min

let utapi: UTApi | null = null;

function getUtApi(): UTApi {
  if (!utapi) utapi = new UTApi();
  return utapi;
}

export type SignedPhoto = {
  key: string;
  /** null quando o Uploadthing não está configurado ou a key não existe */
  url: string | null;
};

export async function getSignedPhotoUrls(
  keys: string[],
): Promise<SignedPhoto[]> {
  return Promise.all(
    keys.map(async (key) => {
      try {
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
