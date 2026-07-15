import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  /**
   * Upload de imagens públicas do catálogo de produtos.
   * Não recebe fotos sensíveis de crianças; serve para capa/mockup do produto na loja.
   */
  productImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 6,
    },
  })
    .middleware(async () => ({ uploadedAt: new Date().toISOString() }))
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
