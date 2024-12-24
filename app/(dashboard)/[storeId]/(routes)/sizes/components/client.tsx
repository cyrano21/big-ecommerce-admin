'use client'

import React from 'react'

import { Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { Heading } from '@/components/ui/heading'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { columns, SizeColumn } from './columns'
import { DataTable } from '@/components/ui/data-table'
import { ApiList } from '@/components/ui/api-list'

interface SizesClientProps {
  data: SizeColumn[]
}

export const SizesClient: React.FC<SizesClientProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  return (
    <>
      <div className="flex items-ceenter justify-between">
        <Heading
          title={`Tailles (${data.length})`}
          description="Gérez les tailles"
        />
        <Button onClick={() => router.push(`/${params.storeId}/sizes/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une taille
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} />
      <Heading title="API" description="Appels d'API pour les tailles" />
      <Separator />
      <ApiList entityName="sizes" entityIdName="sizeId" />
    </>
  )
}

export default SizesClient
