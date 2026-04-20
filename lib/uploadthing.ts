import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  /**
   * Upload de fotos de crianças para o wizard de personalização.
   *
   * LGPD:
   * - Bucket privado (não listado publicamente)
   * - Limite: 4 fotos, 8MB cada
   * - ACL: apenas URL assinada com expiração curta (15min) para preview público
   * - Após upload, fileKey entra no Customization e URL é regenerada via signed URL
   */
  childPhoto: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 4,
      acl: "private",
    },
  })
    .middleware(async () => {
      // No MVP, upload é anônimo — o consentimento é registrado no Customization ao
      // criar o pedido. Isso permite visitantes completarem o wizard sem login.
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      if (!file.key) {
        throw new UploadThingError("Missing file key from Uploadthing");
      }
      return {
        fileKey: file.key,
        url: file.ufsUrl ?? file.url,
        name: file.name,
        uploadedAt: metadata.uploadedAt,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
