'use client'

import React from 'react'
import { Plus, Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Heading } from '@/components/ui/heading'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/ui/data-table'
import { ApiList } from '@/components/ui/api-list'
import toast from 'react-hot-toast'
import axios from 'axios'
import { AlertModal } from '@/components/modals/alert-modal'
import {
  RowSelectionProviderProducts,
  useRowSelectionProducts,
} from './RowSelectionContextProducts'
import { columns, ProductColumn } from './columns'

interface ProductClientProps {
  data: ProductColumn[]
}

const ProductClientContent: React.FC<ProductClientProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  const { selectedProducts, setSelectedProducts } = useRowSelectionProducts()
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  const handleDeleteSelected = async () => {
    setLoading(true)
    try {
      await Promise.all(
        selectedProducts.map(async (product) => {
          await axios.delete(`/api/${params.storeId}/products/${product.id}`)
        })
      )
      toast.success('Les produits sélectionnés ont été supprimés.')
      router.refresh()
    } catch (error) {
      toast.error('Erreur lors de la suppression des produits.')
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
          title={`Produits (${data.length})`}
          description="Gérez les produits de votre boutique"
        />
        <div className="flex space-x-2">
          <Button
            onClick={() => setOpen(true)}
            disabled={selectedProducts.length === 0}
            variant="destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Supprimer les produits sélectionnés
          </Button>
          <Button
            onClick={() => router.push(`/${params.storeId}/products/new`)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un produit
          </Button>
        </div>
      </div>
      <Separator />
      <DataTable<ProductColumn, unknown>
        columns={columns}
        data={data}
        onRowSelectionChange={setSelectedProducts}
      />
      <Heading title="API" description="Appels d'API pour les produits" />
      <Separator />
      <ApiList entityName="products" entityIdName="productId" />
    </>
  )
}

const ProductClient: React.FC<ProductClientProps> = ({ data }) => {
  return (
    <RowSelectionProviderProducts>
      <ProductClientContent data={data} />
    </RowSelectionProviderProducts>
  )
}

export default ProductClient
