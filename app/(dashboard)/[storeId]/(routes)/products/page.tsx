import React from 'react'
import prismadb from '@/lib/prismadb'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatter } from '@/lib/utils'
import { ProductColumn } from '@/types';
import { Product, ProductVariation } from "@prisma/client";
import ProductClient from './components/client'

type ProductWithRelations = Product & {
  category: {
    name: string;
  };
  images: {
    url: string;
  }[];
  variations: (ProductVariation & {
    color: {
      id: string;
      value: string;
    };
    size: {
      id: string;
      name: string;
    };
  })[];
};

const ProductsPage = async ({
  params,
}: {
  params: {
    storeId: string
  }
}) => {
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      category: {
        select: {
          name: true
        }
      },
      images: {
        select: {
          url: true
        }
      },
      variations: {
        include: {
          color: {
            select: {
              id: true,
              value: true
            }
          },
          size: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedProducts: ProductColumn[] = (products as ProductWithRelations[]).map((item) => {
    // Prendre la première variation comme représentative pour l'affichage principal
    const firstVariation = item.variations[0];
    const totalStock = item.variations.reduce((sum, v) => sum + v.stock, 0);
    
    return {
      id: item.id,
      name: item.name,
      isFeatured: item.isFeatured,
      isArchived: item.isArchived,
      price: formatter.format(item.price.toNumber()),
      category: item.category.name,
      size: firstVariation?.size.name ?? 'N/A',
      color: firstVariation?.color.value ?? 'N/A',
      stock: totalStock,
      images: item.images.map(img => ({ url: img.url })),
      createdAt: format(item.createdAt, 'd MMMM yyyy', { locale: fr }),
      variations: item.variations.map(v => ({
        id: v.id,
        colorId: v.color.id,
        colorValue: v.color.value,
        sizeId: v.size.id,
        stock: v.stock,
        images: []
      })),
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
