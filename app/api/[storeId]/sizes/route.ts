import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '@/lib/prismadb'

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { name, value } = body

    if (!userId) {
      return new NextResponse('Non autorisé', { status: 401 })
    }

    if (!name) {
      return new NextResponse('Le nom est réquis', {
        status: 400,
      })
    }

    if (!value) {
      return new NextResponse('La valeur est réquise', {
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
      return new NextResponse('Non autorisé', {
        status: 403,
      })
    }

    const size = await prismadb.size.create({
      data: {
        name,
        value,
        storeId: params.storeId,
      },
    })

    return NextResponse.json(size)
  } catch (error) {
    console.log('[SIZES_POST]', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("L'identifiant de la taille est réquis", {
        status: 400,
      })
    }

    const sizes = await prismadb.size.findMany({
      where: {
        storeId: params.storeId,
      },
    })

    return NextResponse.json(sizes)
  } catch (error) {
    console.log('[SIZES_GET]', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
}
