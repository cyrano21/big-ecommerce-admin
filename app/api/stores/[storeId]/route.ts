import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '@/lib/prismadb'

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 })
    }
    const body = await req.json()

    const { name } = body

    if (!name) {
      return new NextResponse('Le Nom de la boutique est manquant', {
        status: 400,
      })
    }

    if (!params.storeId) {
      return new NextResponse('ID de la boutique est manquant', { status: 400 })
    }

    const store = await prismadb.store.updateMany({
      where: {
        id: params.storeId,
        userId,
      },
      data: {
        name,
      },
    })
    return NextResponse.json(store)
  } catch (error) {
    console.log(`[STORE_PATCH]`, error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 })
    }

    if (!params.storeId) {
      return new NextResponse('ID de la boutique est manquant', { status: 400 })
    }

    const store = await prismadb.store.deleteMany({
      where: {
        id: params.storeId,
        userId,
      },
    })
    return NextResponse.json(store)
  } catch (error) {
    console.log(`[STORE_DELETE]`, error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}
