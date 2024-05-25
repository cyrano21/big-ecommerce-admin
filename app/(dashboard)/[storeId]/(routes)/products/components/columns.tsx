import { ColumnDef } from '@tanstack/react-table'
import { CellAction } from './cell-action'
import Image from 'next/image'
import { Checkbox } from '@/components/ui/checkbox'

export type ProductColumn = {
  id: string
  name: string
  price: string
  size: string
  category: string
  color: string
  images: { url: string }[]
  isFeatured: boolean
  isArchived: boolean
  createdAt: string
}

export const columns: ColumnDef<ProductColumn>[] = [
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
    accessorKey: 'name',
    header: 'Nom',
  },
  {
    accessorKey: 'isArchived',
    header: 'Archivé',
  },
  {
    accessorKey: 'isFeatured',
    header: 'Mis en avant',
  },
  {
    accessorKey: 'price',
    header: 'Prix',
  },
  {
    accessorKey: 'category',
    header: 'Catégorie',
  },
  {
    accessorKey: 'size',
    header: 'Taille',
  },
  {
    accessorKey: 'color',
    header: 'Couleur',
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.color}
        <div
          className="w-6 h-6 rounded-full border"
          style={{ backgroundColor: row.original.color }}
        />
      </div>
    ),
  },
  {
    accessorKey: 'images',
    header: 'Image',
    cell: (info) => {
      const images = info.getValue() as { url: string }[]
      console.log('images:', images)

      // Vérifier si images est bien un tableau
      if (!Array.isArray(images)) {
        console.error('images is not an array:', images)
        return <div>Pas d&apos;image</div>
      }

      // Récupérer la première URL valide
      const firstImageUrl = images.length > 0 ? images[0].url : null
      console.log('firstImageUrl:', firstImageUrl)

      if (!firstImageUrl) return <div>Pas d&apos;image</div>

      return (
        <div className="imageContainer">
          <Image
            className="productImage"
            src={firstImageUrl}
            alt="Product"
            width={40}
            height={40}
            layout="fixed"
          />
        </div>
      )
    },
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
