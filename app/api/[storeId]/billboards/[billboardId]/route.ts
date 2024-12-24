import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '../../../../../lib/prismadb'

export async function GET(
  _req: Request,
  { params }: { params: { billboardId: string } }
) {
  try {
    if (!params.billboardId) {
      return new NextResponse("L'identifiant du panneau est obligatoire", {
        status: 400,
      })
    }

    const billboard = await prismadb.billboard.findUnique({
      where: { id: params.billboardId },
    })

    return NextResponse.json(billboard)
  } catch (error) {
    console.error('[BILLBOARD_GET]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { label, imageUrl } = body

    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 })
    }

    if (!label) {
      return new NextResponse("L'étiquette est obligatoire", { status: 400 })
    }

    if (!imageUrl) {
      return new NextResponse("L'URL de l'image est obligatoire", {
        status: 400,
      })
    }

    if (!params.billboardId) {
      return new NextResponse("L'identifiant du panneau est obligatoire", {
        status: 400,
      })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    })

    if (!storeByUserId) {
      return new NextResponse('Non autorisé', { status: 403 })
    }

    const billboard = await prismadb.billboard.updateMany({
      where: { id: params.billboardId },
      data: { label, imageUrl },
    })

    return NextResponse.json(billboard)
  } catch (error) {
    console.error('[BILLBOARD_PATCH]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 })
    }

    if (!params.billboardId) {
      return new NextResponse("L'identifiant du panneau est obligatoire", {
        status: 400,
      })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    })

    if (!storeByUserId) {
      return new NextResponse('Boutique absente', { status: 404 })
    }

    const billboard = await prismadb.billboard.deleteMany({
      where: { id: params.billboardId },
    })

    return NextResponse.json({ billboard })
  } catch (error) {
    console.error('[BILLBOARD_DELETE]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}
