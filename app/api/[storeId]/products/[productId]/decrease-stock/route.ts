import { NextResponse } from 'next/server'
import prismadb from '../../../../../../lib/prismadb'

export async function POST(
  _req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  const { productId } = params

  try {
    const product = await prismadb.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: 1,
        },
      },
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to decrease stock', { status: 500 })
  }
}
