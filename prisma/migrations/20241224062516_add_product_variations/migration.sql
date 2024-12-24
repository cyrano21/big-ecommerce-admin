/*
  Warnings:

  - You are about to drop the column `colorId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sizeId` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Product_colorId_idx";

-- DropIndex
DROP INDEX "Product_sizeId_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "colorId";
ALTER TABLE "Product" DROP COLUMN "sizeId";

-- CreateTable
CREATE TABLE "ProductVariation" (
    "id" STRING NOT NULL,
    "productId" STRING NOT NULL,
    "sizeId" STRING NOT NULL,
    "colorId" STRING NOT NULL,
    "stock" INT4 NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ColorToProduct" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToSize" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateIndex
CREATE INDEX "ProductVariation_productId_idx" ON "ProductVariation"("productId");

-- CreateIndex
CREATE INDEX "ProductVariation_sizeId_idx" ON "ProductVariation"("sizeId");

-- CreateIndex
CREATE INDEX "ProductVariation_colorId_idx" ON "ProductVariation"("colorId");

-- CreateIndex
CREATE UNIQUE INDEX "_ColorToProduct_AB_unique" ON "_ColorToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_ColorToProduct_B_index" ON "_ColorToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToSize_AB_unique" ON "_ProductToSize"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToSize_B_index" ON "_ProductToSize"("B");
