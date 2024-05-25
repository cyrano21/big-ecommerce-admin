import React from 'react'

import { format } from 'date-fns'

import { BillboardColumn } from './components/columns'
import { BillboardClient } from './components/client'
import { fr } from 'date-fns/locale'
import prismadb from '../../../../../lib/prismadb'

const BillboardsPage = async ({
  params,
}: {
  params: {
    storeId: string
  }
}) => {
  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const formattedBillboards: BillboardColumn[] = billboards.map(
    (billboard: { id: any; label: any; imageUrl: any; createdAt: any }) => ({
      id: billboard.id,
      label: billboard.label,
      imageUrl: billboard.imageUrl,
      createdAt: format(billboard.createdAt, 'd MMMM yyyy', { locale: fr }),
    })
  )

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient data={formattedBillboards} />
      </div>
    </div>
  )
}

export default BillboardsPage
