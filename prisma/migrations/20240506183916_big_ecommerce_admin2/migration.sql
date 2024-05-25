-- DropIndex
DROP INDEX "Billboard_storeId_idx";

-- CreateTable
CREATE TABLE "Category" (
    "id" STRING NOT NULL,
    "storeId" STRING NOT NULL,
    "billboardId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Size" (
    "id" STRING NOT NULL,
    "storeId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "value" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Color" (
    "id" STRING NOT NULL,
    "storeId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "value" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" STRING NOT NULL,
    "storeId" STRING NOT NULL,
    "categoryId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "isFeatured" BOOL NOT NULL DEFAULT false,
    "isArchived" BOOL NOT NULL DEFAULT false,
    "sizeId" STRING NOT NULL,
    "colorId" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" STRING NOT NULL,
    "productId" STRING NOT NULL,
    "url" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" STRING NOT NULL,
    "storeId" STRING NOT NULL,
    "isPaid" BOOL NOT NULL DEFAULT false,
    "phone" STRING NOT NULL DEFAULT '',
    "address" STRING NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" STRING NOT NULL,
    "orderId" STRING NOT NULL,
    "productId" STRING NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_storeId_idx" ON "Category"("storeId");

-- CreateIndex
CREATE INDEX "Category_billboardId_idx" ON "Category"("billboardId");

-- CreateIndex
CREATE INDEX "Size_storeId_idx" ON "Size"("storeId");

-- CreateIndex
CREATE INDEX "Color_storeId_idx" ON "Color"("storeId");

-- CreateIndex
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_sizeId_idx" ON "Product"("sizeId");

-- CreateIndex
CREATE INDEX "Product_colorId_idx" ON "Product"("colorId");

-- CreateIndex
CREATE INDEX "Image_productId_idx" ON "Image"("productId");

-- CreateIndex
CREATE INDEX "Order_storeId_idx" ON "Order"("storeId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "Billboard_storeId_createdAt_idx" ON "Billboard"("storeId", "createdAt");

-- CreateIndex
CREATE INDEX "Store_userId_idx" ON "Store"("userId");
