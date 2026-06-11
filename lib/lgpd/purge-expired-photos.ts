/**
 * Purga LGPD: apaga do storage as fotos de crianças cujo prazo de retenção
 * (photosExpireAt, preenchido quando o pedido vira ENTREGUE) já venceu.
 *
 * Dependências injetadas para testabilidade — a fiação real (Prisma + UTApi)
 * fica em app/api/cron/purge-photos/route.ts.
 */

export type ExpiredCustomization = {
  orderId: string;
  photoKeys: string[];
};

export type PurgeDeps = {
  /** Customizations com photosExpireAt <= now e fotos ainda presentes */
  findExpired: (now: Date) => Promise<ExpiredCustomization[]>;
  /** Remove os arquivos do storage (Uploadthing) */
  deleteFiles: (keys: string[]) => Promise<void>;
  /** Zera photoKeys da customization após a exclusão no storage */
  clearPhotoKeys: (orderId: string) => Promise<void>;
};

export type PurgeResult = {
  /** customizations totalmente purgadas */
  purged: number;
  /** total de arquivos removidos do storage */
  photosDeleted: number;
  /** customizations que falharam (tentadas de novo no próximo cron) */
  failures: number;
};

export async function purgeExpiredPhotos(
  deps: PurgeDeps,
  now: Date = new Date(),
): Promise<PurgeResult> {
  const expired = await deps.findExpired(now);

  let purged = 0;
  let photosDeleted = 0;
  let failures = 0;

  // sequencial de propósito: lote pequeno (cron diário) e mais fácil de
  // raciocinar sobre falha parcial — quem falhou fica para o próximo dia
  for (const customization of expired) {
    try {
      if (customization.photoKeys.length > 0) {
        await deps.deleteFiles(customization.photoKeys);
      }
      await deps.clearPhotoKeys(customization.orderId);
      purged += 1;
      photosDeleted += customization.photoKeys.length;
    } catch (err) {
      failures += 1;
      console.error(
        `[lgpd:purge] falha ao purgar pedido ${customization.orderId}`,
        err,
      );
    }
  }

  return { purged, photosDeleted, failures };
}
