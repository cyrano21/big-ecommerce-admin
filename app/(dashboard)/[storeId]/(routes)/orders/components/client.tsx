'use client'

import React, { useState } from 'react'
import { OrderColumn } from './types'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { columns } from './columns'
import { DataTable } from '@/components/ui/data-table'

interface OrderClientProps {
  data: OrderColumn[]
  storeId: string
}

export const OrderClient: React.FC<OrderClientProps> = ({ data, storeId }) => {
  const [selectedRows, setSelectedRows] = useState<OrderColumn[]>([])
  const router = useRouter()

  const handleDeleteSelected = async () => {
    const ids = selectedRows.map((row) => row.id)
    try {
      await axios.post(`/api/${storeId}/orders/delete-multiple`, { ids })
      toast.success('Les commandes sélectionnées ont été supprimées.')
      router.refresh()
    } catch (error) {
      toast.error(
        "Une erreur s'est produite lors de la suppression des commandes."
      )
    }
  }

  return (
    <>
      <Heading
        title={`Commandes (${data.length})`}
        description="Gérez les commandes de votre boutique"
      />
      <Separator />
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={handleDeleteSelected}
          disabled={selectedRows.length === 0}
        >
          Supprimer les commandes sélectionnées
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        onRowSelectionChange={setSelectedRows}
      />
    </>
  )
}

export default OrderClient
