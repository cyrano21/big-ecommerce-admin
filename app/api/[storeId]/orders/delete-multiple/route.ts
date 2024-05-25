import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '../../../../../lib/prismadb'

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth()
    const { ids } = await req.json()

    console.log('IDs des commandes à supprimer:', ids) // Ajoutez ceci pour vérifier les IDs reçus

    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 })
    }

    if (!ids || ids.length === 0) {
      return new NextResponse('Les identifiants des commandes sont requis', {
        status: 400,
      })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    })

    if (!storeByUserId) {
      return new NextResponse('Non autorisé', { status: 403 })
    }

    const deleteResult = await prismadb.order.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    console.log('Deleted orders count:', deleteResult.count) // Ajoutez ceci pour vérifier combien de commandes ont été supprimées

    return new NextResponse('Commandes supprimées avec succès', { status: 200 })
  } catch (error) {
    console.error('[DELETE_MULTIPLE_ORDERS]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}
