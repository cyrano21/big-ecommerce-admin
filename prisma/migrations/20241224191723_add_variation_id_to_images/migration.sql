-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "variationId" STRING;

-- CreateIndex
CREATE INDEX "Image_variationId_idx" ON "Image"("variationId");
