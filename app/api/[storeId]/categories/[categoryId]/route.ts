import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'
import { auth } from '@clerk/nextjs'

export async function GET(
  _req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!params.categoryId) {
      return new NextResponse("L'id de la catégorie  est obligatoire", {
        status: 400,
      })
    }

    const category = await prismadb.category.findUnique({
      where: { id: params.categoryId },
      include: { billboard: true },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('[CATEGORY_GET]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { name, billboardId } = body

    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 })
    }

    if (!name) {
      return new NextResponse('Le nom est obligatoire', { status: 400 })
    }

    if (!billboardId) {
      return new NextResponse("L'identifiant du panneau est obligatoire", {
        status: 400,
      })
    }

    if (!params.categoryId) {
      return new NextResponse("L'identifiant de la catégorie est obligatoire", {
        status: 400,
      })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    })

    if (!storeByUserId) {
      return new NextResponse('Non autorisé', { status: 403 })
    }

    const category = await prismadb.category.updateMany({
      where: { id: params.categoryId },
      data: { name, billboardId },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('[CATEGORY_PATCH]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 })
    }

    if (!params.categoryId) {
      return new NextResponse("L'identifiant de la catégorie est obligatoire", {
        status: 400,
      })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    })

    if (!storeByUserId) {
      return new NextResponse('Boutique non trouvée', { status: 404 })
    }

    const category = await prismadb.category.deleteMany({
      where: { id: params.categoryId },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('[CATEGORY_DELETE]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}
