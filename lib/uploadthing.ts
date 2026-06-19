import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  /**
   * Upload de fotos de crianças para o wizard de personalização.
   *
   * LGPD:
   * - Limite: 4 fotos, 8MB cada
   * - ACL: o plano gratuito do Uploadthing rejeita `acl: "private"` (HTTP 400 no
   *   ingest). Por ora os arquivos usam o padrão public-read com URL não-listada
   *   (chave aleatória). ANTES DO LANÇAMENTO: voltar para `acl: "private"` com
   *   tier pago ou migrar para Supabase Storage com bucket privado + signed URLs.
   * - Após upload, fileKey entra no Customization
   */
  childPhoto: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 4,
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
