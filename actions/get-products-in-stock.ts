import prismadb from '@/lib/prismadb'

export const getProductsInStock = async (storeId: string) => {
  const products = await prismadb.product.findMany({
    where: {
      storeId,
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
      stock: true,
    },
  })

  return products
}
