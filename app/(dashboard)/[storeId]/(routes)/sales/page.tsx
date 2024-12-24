import React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { formatter } from '../../../../../lib/utils'
import SalesClient from './components/client'
import prismadb from '../../../../../lib/prismadb'

const SalesPage = async ({ params }: { params: { storeId: string } }) => {
  const sales = await prismadb.sale.findMany({
    where: { storeId: params.storeId },
    include: {
      saleItems: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const formattedSales = sales.map((sale) => ({
    id: sale.id,
    customerName: sale.customerName,
    products: sale.saleItems
      .map((saleItem: { product: { name: any } }) => saleItem.product.name)
      .join(', '),
    totalPrice: formatter.format(
      sale.saleItems.reduce(
        (total: number, item: { product: { price: any } }) =>
          total + Number(item.product.price),
        0
      )
    ),
    photo:
      sale.saleItems[0]?.product?.images[0]?.url || '/images/default_image.png',
    isPaid: sale.isPaid,
    createdAt: format(sale.createdAt, 'd MMMM yyyy', { locale: fr }),
  }))

  return (
    <div className="flex-col p-8 space-y-4 pt-6">
      <SalesClient data={formattedSales} />
    </div>
  )
}

export default SalesPage
