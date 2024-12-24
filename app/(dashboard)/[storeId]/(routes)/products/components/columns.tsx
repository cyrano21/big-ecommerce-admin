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
  images: string[]
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
      const imageUrls = info.getValue() as string[]
      const firstImageUrl = imageUrls.length > 0 ? imageUrls[0] : null

      // Validate and sanitize image URL
      const sanitizeImageUrl = (url: string | null) => {
        if (!url || typeof url !== 'string') return null;
        
        // Remove any leading/trailing whitespace
        url = url.trim();
        
        // Check if URL starts with http:// or https://
        if (/^https?:\/\//i.test(url)) return url;
        
        // If it's a relative path, prepend with a leading slash
        if (url.startsWith('/')) return url;
        
        // If it looks like a cloudinary or other CDN URL
        if (/^(res\.cloudinary\.com|cdn\.example\.com)/i.test(url)) {
          return `https://${url}`;
        }
        
        return null;
      }

      const validImageUrl = sanitizeImageUrl(firstImageUrl)

      return validImageUrl ? (
        <div className="imageContainer">
          <Image
            className="productImage"
            src={validImageUrl}
            alt="Product"
            width={40}
            height={40}
            layout="fixed"
            onError={(e) => {
              console.error('Image load error:', validImageUrl);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      ) : null
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
