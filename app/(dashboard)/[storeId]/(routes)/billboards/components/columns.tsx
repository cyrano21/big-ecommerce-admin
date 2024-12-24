'use client'

import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import { CellAction } from './cell-action'

export type BillboardColumn = {
  id: string
  label: string
  createdAt: string
  imageUrl?: string
}

export const columns: ColumnDef<BillboardColumn>[] = [
  {
    accessorKey: 'label',
    header: 'Etiquette',
  },
  {
    accessorKey: 'createdAt',
    header: 'Date de création',
  },
  {
    accessorKey: 'imageUrl',
    header: 'Image',
    cell: (data) =>
      data.row.original.imageUrl ? (
        <Image
          src={data.row.original.imageUrl}
          alt={data.row.original.label}
          width={200}
          height={200}
          className="h-10 w-10 rounded-md"
        />
      ) : (
        <div>Image non disponible</div>
      ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
