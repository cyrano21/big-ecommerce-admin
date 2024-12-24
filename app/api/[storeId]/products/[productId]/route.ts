import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '../../../../../lib/prismadb'

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    console.log('🔍 Single Product GET Request');
    console.log('📦 Store ID:', params.storeId);
    console.log('🆔 Product ID:', params.productId);
    console.log('🔗 Full Request URL:', req.url);

    const { searchParams } = new URL(req.url)
    const requestedStoreId = searchParams.get('storeId')

    console.log('📋 Query Parameters:', {
      requestedStoreId,
    });

    if (!params.storeId) {
      console.error('❌ Store ID is missing from route params');
      return new NextResponse("L'identifiant de la boutique est réquis", {
        status: 400,
      })
    }

    if (!params.productId) {
      console.error('❌ Product ID is missing');
      return new NextResponse('Product ID is required', { status: 400 })
    }

    // Validate that the requested store ID matches the route store ID if provided
    if (requestedStoreId && requestedStoreId !== params.storeId) {
      console.error('❌ Store ID mismatch', {
        routeStoreId: params.storeId,
        requestedStoreId
      });
      return new NextResponse('Store ID mismatch', { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: { 
        id: params.productId,
        storeId: params.storeId
      },
      include: {
        category: true,
        size: true,
        color: true,
        images: true
      }
    })

    if (!product) {
      console.warn('⚠️ Product not found');
      return new NextResponse('Product not found', { status: 404 })
    }

    console.log('✅ Product Found:', product.name);
    return NextResponse.json(product)
  } catch (error) {
    console.error('🚨 Single Product GET Error:', error)
    return new NextResponse('Failed to fetch product', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()

    const {
      name,
      description,
      price,
      categoryId,
      colorId,
      sizeId,
      images,
      isFeatured,
      isArchived,
    } = body

    if (!userId) {
      return new NextResponse('Non autorisé', { status: 401 })
    }

    if (
      !name ||
      !price ||
      !categoryId ||
      !colorId ||
      !sizeId ||
      !images ||
      !images.length
    ) {
      return new NextResponse('Tous les champs sont obligatoires', {
        status: 400,
      })
    }

    if (!params.storeId) {
      return new NextResponse("L'identifiant de la boutique est réquis", {
        status: 400,
      })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse('Non autorisé', { status: 403 })
    }

    const product = await prismadb.product.update({
      where: { id: params.productId },
      data: {
        name,
        description,
        price,
        categoryId,
        colorId,
        sizeId,
        isFeatured,
        isArchived,
        images: {
          deleteMany: {},
          createMany: {
            data: images.map((image: { url: string }) => ({
              url: image.url,
            })),
          },
        },
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.log('[PRODUCT_PATCH]', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
}
