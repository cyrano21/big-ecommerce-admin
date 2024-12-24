import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '../../../../lib/prismadb'

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth()
    const { products, customerName, isPaid, saleItems } = await req.json()

    if (!userId) {
      return new NextResponse('Non authentifié', { status: 401 })
    }

    if (!products || products.length === 0) {
      return new NextResponse('Les identifiants des produits sont requis', {
        status: 400,
      })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    })

    if (!storeByUserId) {
      return new NextResponse('Non autorisé', { status: 403 })
    }

    const sale = await prismadb.sale.create({
      data: {
        storeId: params.storeId,
        customerName,
        isPaid,
        saleItems: {
          create: saleItems.map(
            (item: { productId: string; quantity: number; price: number }) => ({
              product: {
                connect: {
                  id: item.productId,
                },
              },
              quantity: item.quantity,
              price: item.price,
            })
          ),
        },
      },
    })

    // Update product stock
    for (const item of saleItems) {
      await prismadb.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    return new NextResponse(JSON.stringify(sale), { status: 200 })
  } catch (error) {
    console.error('[SALE_CREATE]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
}
