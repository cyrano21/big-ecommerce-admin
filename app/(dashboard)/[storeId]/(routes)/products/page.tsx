import React from 'react'
import prismadb from '@/lib/prismadb'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatter } from '@/lib/utils'
import { ProductColumn } from '@/types';
import ProductClient from './components/client'

const ProductsPage = async ({
  params,
}: {
  params: {
    storeId: string
  }
}) => {
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      category: true,
      images: true,
      variations: {
        include: {
          color: true,
          size: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const formattedProducts: ProductColumn[] = products.map((item) => {
    // Prendre la première variation comme représentative
    const firstVariation = item.variations[0];
    
    return {
      id: item.id,
      name: item.name,
      isFeatured: item.isFeatured,
      isArchived: item.isArchived,
      price: formatter.format(item.price.toNumber()),
      category: item.category.name,
      size: firstVariation?.size.name ?? 'N/A',
      color: firstVariation?.color.value ?? 'N/A',
      images: item.images.map((img) => img.url),
      createdAt: format(item.createdAt, 'd MMMM yyyy', { locale: fr }),
    };
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient data={formattedProducts} />
      </div>
    </div>
  )
}

export default ProductsPage
