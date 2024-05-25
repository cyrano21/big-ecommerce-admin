import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';

// Handler pour la méthode GET
export async function GET(req: Request, { params }: { params: { productId: string } }) {
  try {
    const product = await prismadb.product.findUnique({
      where: { id: params.productId },
      include: {
        category: true,
        size: true,
        color: true,
        images: true,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_API]', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

// Handler pour la méthode PATCH
export async function PATCH(req: Request, { params }: { params: { storeId: string, productId: string } }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 });
    }

    const body = await req.json();
    const { name, price, categoryId, colorId, sizeId, images, isFeatured, isArchived } = body;

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse('Non autorisé', { status: 403 });
    }

    const product = await prismadb.product.update({
      where: { id: params.productId },
      data: {
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        isFeatured,
        isArchived,
        images: {
          deleteMany: {},
          createMany: {
            data: images.map((image: { url: string }) => ({ url: image.url })),
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_API]', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

// Handler pour la méthode DELETE
export async function DELETE(req: Request, { params }: { params: { storeId: string, productId: string } }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse('Non autorisé', { status: 403 });
    }

    await prismadb.product.delete({
      where: { id: params.productId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[PRODUCT_API]', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}
