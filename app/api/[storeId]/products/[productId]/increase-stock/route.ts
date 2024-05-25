import prismadb from '@/lib/prismadb';
import { NextResponse } from 'next/server'


export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { productId } = params

    if (!productId) {
      return new NextResponse('Product ID is required', { status: 400 })
    }

    const {
      name,
      price,
      categoryId,
      colorId,
      sizeId,
      images,
      isFeatured,
      isArchived,
    } = await req.json()

    const product = await prismadb.product.update({
      where: { id: productId },
      data: {
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        isFeatured,
        isArchived,
        images: {
          deleteMany: {}, // Supprime les anciennes images
          createMany: {
            data: images.map((image: { url: string }) => ({
              url: image.url,
            })),
          },
        },
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('[PRODUCT_PATCH]', error)
    return new NextResponse('Failed to update product', { status: 500 })
  }
}
