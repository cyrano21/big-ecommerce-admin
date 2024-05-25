'use client'

import React from 'react'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/ui/data-table'
import { columns, SalesColumn } from './columns'
import { AlertModal } from '@/components/modals/alert-modal'
import { Plus, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import axios from 'axios'
import {
  RowSelectionProvider,
  useRowSelection,
} from './RowSelectionContextSales'

interface SalesClientProps {
  data: SalesColumn[]
}

const SalesClientContent: React.FC<SalesClientProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  const { selectedItems: selectedSales, setSelectedItems: setSelectedSales } =
    useRowSelection()
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  const handleDeleteSelected = async () => {
    setLoading(true)
    try {
      await Promise.all(
        selectedSales.map(async (sale: { id: any }) => {
          await axios.delete(`/api/${params.storeId}/sales/${sale.id}`)
        })
      )
      toast.success('Les ventes sélectionnées ont été supprimées.')
      router.refresh()
    } catch (error) {
      toast.error('Erreur lors de la suppression des ventes.')
      console.error(error)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDeleteSelected}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading
          title={`Ventes (${data.length})`}
          description="Gérez les ventes de votre boutique"
        />
        <div className="flex space-x-2">
          <Button
            onClick={() => setOpen(true)}
            disabled={selectedSales.length === 0}
            variant="destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Supprimer les ventes sélectionnées
          </Button>
          <Button onClick={() => router.push(`/${params.storeId}/sales/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une vente
          </Button>
        </div>
      </div>
      <Separator />
      <DataTable<SalesColumn, unknown>
        columns={columns}
        data={data}
        onRowSelectionChange={setSelectedSales}
      />
      <Heading title="API" description="Appels d'API pour les ventes" />
      <Separator />
    </>
  )
}

const SalesClient: React.FC<SalesClientProps> = ({ data }) => {
  return (
    <RowSelectionProvider>
      <SalesClientContent data={data} />
    </RowSelectionProvider>
  )
}

export default SalesClient
