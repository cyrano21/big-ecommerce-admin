'use client'

import React from 'react'

import { Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { Heading } from '@/components/ui/heading'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CategoryColumn, columns } from './columns'
import { DataTable } from '../../../../../../components/ui/data-table'
import { ApiList } from '@/components/ui/api-list'

interface CategoryClientProps {
  data: CategoryColumn[]
}

export const CategoryClient: React.FC<CategoryClientProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  return (
    <>
      <div className="flex items-ceenter justify-between">
        <Heading
          title={`Categories (${data.length})`}
          description="Gérez les catégories"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/categories/new`)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} />
      <Heading title="API" description="Appels d'API pour les catégories" />
      <Separator />
      <ApiList entityName="category" entityIdName="categoryId" />
    </>
  )
}

export default CategoryClient
