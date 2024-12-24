'use client'

import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import { CellAction } from './cell-action'
import { Checkbox } from '@/components/ui/checkbox'

export type SalesColumn = {
  id: string
  photo?: string
  products: string
  customerName: string
  isPaid: boolean
  totalPrice: string
  createdAt: string
}

export const columns: ColumnDef<SalesColumn>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        className="custom-checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="custom-checkbox"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    meta: {
      disableSorting: true,
    },
  },
  {
    accessorKey: 'products',
    header: 'Produits',
  },
  {
    accessorKey: 'photo',
    header: 'Image',
    cell: (info) => {
      const imageUrl = info.getValue() as string
      return imageUrl ? (
        <div className="relative w-[100px] h-[100px]">
          <Image
            src={imageUrl}
            alt="Product Image"
            fill
            sizes="(max-width: 768px) 100px, 100px"
            className="object-cover"
            priority
          />
        </div>
      ) : null
    },
  },
  {
    accessorKey: 'customerName',
    header: 'Nom du client',
  },
  {
    accessorKey: 'totalPrice',
    header: 'Prix total',
  },
  {
    accessorKey: 'isPaid',
    header: 'Payé',
  },
  {
    accessorKey: 'createdAt',
    header: 'Date de création',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
