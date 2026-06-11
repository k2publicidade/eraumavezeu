import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { purgeExpiredPhotos } from "@/lib/lgpd/purge-expired-photos";
import { deletePhotoFiles } from "@/lib/uploadthing-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/purge-photos — agendado no vercel.json (diário).
 * A Vercel envia "Authorization: Bearer ${CRON_SECRET}" automaticamente.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await purgeExpiredPhotos({
    findExpired: (now) =>
      db.customization.findMany({
        where: {
          photosExpireAt: { lte: now },
          NOT: { photoKeys: { isEmpty: true } },
        },
        select: { orderId: true, photoKeys: true },
      }),
    deleteFiles: deletePhotoFiles,
    clearPhotoKeys: async (orderId) => {
      await db.customization.update({
        where: { orderId },
        data: { photoKeys: [] },
      });
    },
  });

  console.log(
    `[lgpd:purge] purged=${result.purged} photos=${result.photosDeleted} failures=${result.failures}`,
  );
  return NextResponse.json(result);
}
