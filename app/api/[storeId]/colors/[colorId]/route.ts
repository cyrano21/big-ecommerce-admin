import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '@/lib/prismadb'

export async function GET(
  _req: Request,
  { params }: { params: { colorId: string } }
) {
  try {
    if (!params.colorId) {
      return new NextResponse("L'identifiant de la coleur est obligatoire", {
        status: 400,
      })
    }

    const color = await prismadb.billboard.findUnique({
      where: { id: params.colorId },
    })

    return NextResponse.json(color)
  } catch (error) {
    console.error('[COLOR_GET]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { name, value } = body

    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 })
    }

    if (!name) {
      return new NextResponse('Le nom est obligatoire', { status: 400 })
    }

    if (!value) {
      return new NextResponse("L'URL de la valeur est obligatoire", {
        status: 400,
      })
    }

    if (!params.colorId) {
      return new NextResponse("L'identifiant de la couleur est obligatoire", {
        status: 400,
      })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    })

    if (!storeByUserId) {
      return new NextResponse('Non autorisé', { status: 403 })
    }

    const color = await prismadb.color.updateMany({
      where: { id: params.colorId },
      data: { name, value },
    })

    return NextResponse.json(color)
  } catch (error) {
    console.error('[COLOR_PATCH]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 })
    }

    if (!params.colorId) {
      return new NextResponse("L'identifiant de la couleur est obligatoire", {
        status: 400,
      })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    })

    if (!storeByUserId) {
      return new NextResponse('Couleur non trouvée', { status: 404 })
    }

    const color = await prismadb.color.deleteMany({
      where: { id: params.colorId },
    })

    return NextResponse.json({ color })
  } catch (error) {
    console.error('[COLOR_DELETE]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}
