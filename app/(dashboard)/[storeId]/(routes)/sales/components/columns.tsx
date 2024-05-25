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
        <div className="imageContainer">
          <Image
            src={imageUrl}
            alt="Product Image"
            width={100}
            height={100}
            layout="responsive"
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
