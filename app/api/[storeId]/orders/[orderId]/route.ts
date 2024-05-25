import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '../../../../../lib/prismadb'

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; orderId: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 })
    }

    if (!params.orderId) {
      return new NextResponse("L'identifiant de la commande est obligatoire", {
        status: 400,
      })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    })

    if (!storeByUserId) {
      return new NextResponse('Non autorisé', { status: 403 })
    }

    const order = await prismadb.order.delete({
      where: { id: params.orderId },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('[ORDER_DELETE]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}
