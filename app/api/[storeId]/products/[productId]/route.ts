import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

// Gestion des requêtes GET
export async function GET(req: Request, { params }: { params: { productId: string } }) {
  try {
    const product = await prismadb.product.findUnique({
      where: { id: params.productId },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
      },
    });

    if (!product) {
      return new NextResponse('Produit non trouvé', { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('[PRODUCT_GET]', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

// Gestion des requêtes POST
export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      name,
      price,
      categoryId,
      colorId,
      sizeId,
      images,
      isFeatured,
      isArchived,
    } = body;

    if (!userId) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    if (!name || !price || !categoryId || !colorId || !sizeId || !images || !images.length) {
      return new NextResponse('Tous les champs sont obligatoires', { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("L'identifiant de la boutique est réquis", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Non autorisé', { status: 403 });
    }

    const product = await prismadb.product.create({
      data: {
        name,
        price,
        isFeatured,
        isArchived,
        categoryId,
        colorId,
        sizeId,
        storeId: params.storeId,
        images: {
          createMany: {
            data: images.map((image: { url: string }) => ({ url: image.url })),
          },
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.log('[PRODUCTS_POST]', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}
