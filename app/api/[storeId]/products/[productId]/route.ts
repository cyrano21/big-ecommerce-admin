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
        images: true,
        variations: {
          include: {
            color: true,
            size: true
          }
        }
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
      variations,
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
      !images ||
      !images.length
    ) {
      return new NextResponse('Les champs nom, prix, catégorie et images sont obligatoires', {
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

    // Supprimer les variations existantes si de nouvelles variations sont fournies
    if (variations) {
      await prismadb.productVariation.deleteMany({
        where: {
          productId: params.productId
        }
      });
    }

    const updatedProduct = await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        description,
        price,
        categoryId,
        images: {
          deleteMany: {},
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
        ...(variations && variations.length > 0 && {
          variations: {
            createMany: {
              data: variations.map((variation: { colorId: string, sizeId: string, stock: number }) => ({
                colorId: variation.colorId,
                sizeId: variation.sizeId,
                stock: variation.stock
              }))
            }
          }
        }),
        isFeatured,
        isArchived,
      },
      include: {
        images: true,
        category: true,
        variations: {
          include: {
            size: true,
            color: true
          }
        }
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.log('[PRODUCT_PATCH]', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
}
