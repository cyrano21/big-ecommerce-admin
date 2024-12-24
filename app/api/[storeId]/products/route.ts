import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '../../../../lib/prismadb'

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
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
      !description ||
      !price ||
      !categoryId ||
      !images ||
      !images.length
    ) {
      return new NextResponse('Les champs nom, description, prix, catégorie et images sont obligatoires', {
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

    const product = await prismadb.product.create({
      data: {
        name,
        description,
        price,
        isFeatured,
        isArchived,
        categoryId,
        storeId: params.storeId,
        images: {
          createMany: {
            data: images.map((image: { url: string }) => ({ url: image.url })),
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
        })
      },
      include: {
        variations: {
          include: {
            color: true,
            size: true
          }
        },
        category: true,
        images: true
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.log('[PRODUCTS_POST]', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    console.log('🔍 Products GET Request');
    console.log('📦 Store ID:', params.storeId);
    console.log('🔗 Full Request URL:', req.url);

    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId') || undefined
    const colorId = searchParams.get('colorId') || undefined
    const sizeId = searchParams.get('sizeId') || undefined
    const isFeatured = searchParams.get('isFeatured')
    const requestedStoreId = searchParams.get('storeId')

    console.log('📋 Query Parameters:', {
      categoryId,
      colorId,
      sizeId,
      isFeatured,
      requestedStoreId,
    });

    if (!params.storeId) {
      console.error('❌ Store ID is missing from route params');
      return new NextResponse("L'identifiant de la boutique est réquis", {
        status: 400,
      })
    }

    // Validate that the requested store ID matches the route store ID if provided
    if (requestedStoreId && requestedStoreId !== params.storeId) {
      console.error('❌ Store ID mismatch', {
        routeStoreId: params.storeId,
        requestedStoreId
      });
      return new NextResponse('Store ID mismatch', { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        variations: colorId || sizeId ? {
          some: {
            ...(colorId ? { colorId } : {}),
            ...(sizeId ? { sizeId } : {})
          }
        } : undefined,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        variations: {
          include: {
            color: true,
            size: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log('📦 Products Found:', products.length);
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error('🚨 Products GET Error:', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
}
