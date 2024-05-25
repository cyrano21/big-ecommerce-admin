'use client'

import React from 'react'

import { Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { Heading } from '@/components/ui/heading'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ColorColumn, columns } from './columns'
import { DataTable } from '@/components/ui/data-table'
import { ApiList } from '@/components/ui/api-list'

interface ColorsClientProps {
  data: ColorColumn[]
}

export const ColorsClient: React.FC<ColorsClientProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  return (
    <>
      <div className="flex items-ceenter justify-between">
        <Heading
          title={`Couleurs (${data.length})`}
          description="Gérez les couleurs"
        />
        <Button onClick={() => router.push(`/${params.storeId}/colors/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une couleur
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} />
      <Heading title="API" description="Appels d'API pour les couleurs" />
      <Separator />
      <ApiList entityName="colors" entityIdName="colorId" />
    </>
  )
}

export default ColorsClient
