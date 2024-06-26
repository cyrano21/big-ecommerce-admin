import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '@/lib/prismadb'

export async function GET(
  _req: Request,
  { params }: { params: { sizeId: string } }
) {
  try {
    if (!params.sizeId) {
      return new NextResponse("L'identifiant de la taille est obligatoire", {
        status: 400,
      })
    }

    const size = await prismadb.billboard.findUnique({
      where: { id: params.sizeId },
    })

    return NextResponse.json(size)
  } catch (error) {
    console.error('[SIZE_GET]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
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

    if (!params.sizeId) {
      return new NextResponse("L'identifiant de la taille est obligatoire", {
        status: 400,
      })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    })

    if (!storeByUserId) {
      return new NextResponse('Non autorisé', { status: 403 })
    }

    const size = await prismadb.size.updateMany({
      where: { id: params.sizeId },
      data: { name, value },
    })

    return NextResponse.json(size)
  } catch (error) {
    console.error('[SIZE_PATCH]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 })
    }

    if (!params.sizeId) {
      return new NextResponse("L'identifiant de la taille est obligatoire", {
        status: 400,
      })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    })

    if (!storeByUserId) {
      return new NextResponse('Taille non trouvée', { status: 404 })
    }

    const size = await prismadb.size.deleteMany({
      where: { id: params.sizeId },
    })

    return NextResponse.json({ size })
  } catch (error) {
    console.error('[SIZE_DELETE]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}
