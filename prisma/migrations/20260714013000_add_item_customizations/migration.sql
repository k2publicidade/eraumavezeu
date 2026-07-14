CREATE TABLE "OrderItemCustomization" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "unitIndex" INTEGER NOT NULL DEFAULT 0,
    "productType" "ProductType" NOT NULL,
    "childName" TEXT NOT NULL,
    "childAge" INTEGER NOT NULL,
    "childGender" TEXT NOT NULL,
    "favoriteColor" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "storyGenre" TEXT,
    "artStyle" TEXT,
    "lineStyle" TEXT,
    "dedication" TEXT,
    "notes" TEXT,
    "photoKeys" TEXT[],
    "aiPrompt" TEXT,
    "consentIp" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "consentTextVersion" TEXT NOT NULL,
    "confidentialityAt" TIMESTAMP(3) NOT NULL,
    "photosExpireAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItemCustomization_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderItemCustomization_orderItemId_unitIndex_key"
ON "OrderItemCustomization"("orderItemId", "unitIndex");

CREATE INDEX "OrderItemCustomization_photosExpireAt_idx"
ON "OrderItemCustomization"("photosExpireAt");

ALTER TABLE "OrderItemCustomization"
ADD CONSTRAINT "OrderItemCustomization_orderItemId_fkey"
FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
