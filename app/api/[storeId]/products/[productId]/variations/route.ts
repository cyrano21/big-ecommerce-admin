import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

export async function POST(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { variations } = body;

    if (!userId) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    if (!variations || !Array.isArray(variations)) {
      return new NextResponse('Les variations sont requises', { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("L'identifiant de la boutique est requis", { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse("L'identifiant du produit est requis", { status: 400 });
    }

    // Vérifier que l'utilisateur a accès à la boutique
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse('Non autorisé', { status: 403 });
    }

    // Supprimer les variations existantes
    await prismadb.productVariation.deleteMany({
      where: {
        productId: params.productId
      }
    });

    // Créer les nouvelles variations
    const updatedProduct = await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        variations: {
          createMany: {
            data: variations.map((variation: { colorId: string, sizeId: string, stock: number }) => ({
              colorId: variation.colorId,
              sizeId: variation.sizeId,
              stock: variation.stock
            }))
          }
        }
      },
      include: {
        variations: {
          include: {
            size: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.log('[VARIATIONS_POST]', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("L'identifiant de la boutique est requis", { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse("L'identifiant du produit est requis", { status: 400 });
    }

    const variations = await prismadb.productVariation.findMany({
      where: {
        productId: params.productId
      },
      include: {
        color: true,
        size: true
      }
    });

    return NextResponse.json(variations);
  } catch (error) {
    console.log('[VARIATIONS_GET]', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
}
