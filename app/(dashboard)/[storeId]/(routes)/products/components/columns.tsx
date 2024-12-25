import { ColumnDef } from '@tanstack/react-table'
import { CellAction } from './cell-action'
import Image from 'next/image'
import { Checkbox } from '@/components/ui/checkbox'

export type ProductColumn = {
  id: string;
  name: string;
  price: number | string;
  size: string;
  category: string;
  color: string;
  createdAt: string;
  isFeatured: boolean;
  isArchived: boolean;
  stock: number;
  images: { url: string }[];
  variations: {
    id: string;
    colorId: string;
    colorValue: string;
    sizeId: string;
    stock: number;
    images: { url: string }[];
  }[];
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
    accessorKey: 'variations',
    header: 'Variations',
    cell: ({ row }) => {
      const variations = row.original.variations || [];
      
      if (!variations.length) {
        return null;
      }

      return (
        <div className="space-y-3 py-2">
          {variations.map((variation, index) => (
            <div 
              key={variation.id || index} 
              className="
                relative 
                border 
                border-gray-100 
                rounded-xl 
                p-4 
                bg-white 
                shadow-sm 
                hover:shadow-md 
                transition-all 
                duration-200
                hover:border-purple-200
              "
            >
              {/* En-tête de la variation */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="
                        w-4 
                        h-4 
                        rounded-full 
                        border-2 
                        border-white 
                        shadow-sm
                        ring-1
                        ring-gray-100
                      "
                      style={{ backgroundColor: variation.colorValue }}
                    />
                    <span className="
                      font-medium
                      text-gray-700
                      text-xs
                      uppercase
                    ">{variation.colorId}</span>
                  </div>
                  <div className="h-3 w-px bg-gray-200" />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">
                      Taille:
                    </span>
                    <span className="
                      font-medium
                      text-gray-700
                      bg-gray-50
                      px-1.5
                      py-0.5
                      rounded
                      text-xs
                      uppercase
                    ">{variation.sizeId}</span>
                  </div>
                </div>
                <div className="
                  bg-gray-50 
                  px-2
                  py-1
                  rounded-full
                  border
                  border-gray-100
                  shadow-sm
                  hover:bg-gray-100
                  transition-colors
                  duration-200
                ">
                  <span className="text-xs">
                    <span className="text-gray-500">Stock:</span>
                    <span className="
                      ml-1
                      font-medium
                      text-gray-700
                    ">{variation.stock}</span>
                  </span>
                </div>
              </div>

              {/* Images de la variation */}
              {variation.images && variation.images.length > 0 && (
                <div className="flex gap-3 mt-2 overflow-x-auto pb-2">
                  {variation.images.map((image: any, imgIndex: number) => (
                    <div 
                      key={imgIndex} 
                      className="
                        flex-shrink-0
                        relative 
                        aspect-square
                        w-[70px]
                        group 
                        rounded-lg 
                        overflow-hidden
                        border
                        border-gray-100
                        hover:border-purple-200
                        transition-all
                        duration-200
                        bg-gray-50
                      "
                    >
                      <Image
                        fill
                        src={image.url || image}
                        alt={`Variation ${index + 1} Image ${imgIndex + 1}`}
                        className="
                          object-contain 
                          group-hover:scale-105
                          transition-transform 
                          duration-300
                          p-1
                        "
                        sizes="70px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
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
    header: 'Images',
    cell: ({ row }) => {
      const images = row.original.images || [];

      if (!Array.isArray(images) || images.length === 0) {
        return <div className="text-neutral-500 italic">Aucune image</div>;
      }

      return (
        <div className="flex gap-2">
          {images.slice(0, 3).map((image: any, index: number) => (
            <div key={index} className="relative w-[80px] pb-[80px] group">
              <div className="absolute inset-0 rounded-md overflow-hidden border bg-secondary">
                <Image
                  fill
                  src={image.url || image}
                  alt={`Image ${index + 1}`}
                  className="object-contain group-hover:object-cover transition-all duration-300"
                  sizes="80px"
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
          {images.length > 3 && (
            <div className="relative w-[80px] pb-[80px]">
              <div className="absolute inset-0 rounded-md overflow-hidden border bg-secondary flex items-center justify-center text-sm font-medium text-muted-foreground">
                +{images.length - 3}
              </div>
            </div>
          )}
        </div>
      );
    }
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
