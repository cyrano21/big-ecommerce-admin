import React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatter } from '@/lib/utils'
import { OrderClient } from './components/client'
import prismadb from '../../../../../lib/prismadb'
import { OrderColumn } from './components/types'

const OrdersPage = async ({
  params,
}: {
  params: {
    storeId: string
  }
}) => {
  const orders = await prismadb.order.findMany({
    where: { storeId: params.storeId },
    include: {
      orderItems: {
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

  const formattedOrders: OrderColumn[] = orders.map((order) => ({
    id: order.id,
    phone: order.phone,
    address: order.address,
    products: order.orderItems
      .map((orderItem) =>
        orderItem.product ? orderItem.product.name : 'Produit supprimé'
      )
      .join(', '),
    totalPrice: formatter.format(
      order.orderItems.reduce(
        (total, item) => total + Number(item.product.price),
        0
      )
    ),
    photo:
      order.orderItems[0]?.product?.images[0]?.url ||
      '/default order image.webp',
    isPaid: order.isPaid,
    createdAt: format(order.createdAt, 'd MMMM yyyy', { locale: fr }),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} storeId={params.storeId} />
      </div>
    </div>
  )
}

export default OrdersPage
