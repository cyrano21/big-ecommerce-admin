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
            size: true,
            color: true,
            images: true
          }
        }
      }
    })

    console.log('GET Product - Variations with images:', 
      product?.variations.map(v => ({
        id: v.id,
        color: v.color.name,
        size: v.size.name,
        imageCount: v.images.length,
        images: v.images
      }))
    );

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
    const { userId } = auth();
    const body = await req.json();

    const {
      name,
      price,
      categoryId,
      description,
      isFeatured,
      isArchived,
      variations,
    } = body;

    if (!userId) {
      return new NextResponse("Non authentifié", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Le nom est requis", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Le prix est requis", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("L'ID de catégorie est requis", { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse("L'ID du produit est requis", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Non autorisé", { status: 403 });
    }

    // Supprimer d'abord toutes les variations et images existantes
    await prismadb.image.deleteMany({
      where: {
        productId: params.productId
      }
    });

    await prismadb.productVariation.deleteMany({
      where: {
        productId: params.productId
      }
    });

    // Mettre à jour le produit
    const updatedProduct = await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        name,
        price: parseFloat(price.toString()),
        categoryId,
        description,
        isFeatured,
        isArchived,
      }
    });

    // Créer les nouvelles variations et leurs images
    if (variations && variations.length > 0) {
      for (const variation of variations) {
        const newVariation = await prismadb.productVariation.create({
          data: {
            productId: params.productId,
            colorId: variation.colorId,
            sizeId: variation.sizeId,
            stock: parseInt(variation.stock.toString()),
          }
        });

        if (variation.images && variation.images.length > 0) {
          await prismadb.image.createMany({
            data: variation.images.map((image: any) => ({
              url: image.url || image,
              productId: params.productId,
              variationId: newVariation.id
            }))
          });
        }
      }
    }

    // Récupérer le produit mis à jour avec toutes ses relations
    const finalProduct = await prismadb.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        variations: {
          include: {
            images: true,
            color: true,
            size: true
          }
        }
      }
    });

    return NextResponse.json(finalProduct);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
