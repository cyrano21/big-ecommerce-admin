# Fichiers de Gestion des Images

## 1. Product Form
**Chemin**: `/app/(dashboard)/[storeId]/(routes)/products/[productId]/components/product-form.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import * as z from 'zod';
import { Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from "react-hot-toast";
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { AlertModal } from '@/components/modals/alert-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import ImagesUpload from '@/components/ui/images-upload';
import { Textarea } from '@/components/ui/textarea';

// Types
interface Category {
  id: string;
  name: string;
  storeId: string;
  billboard?: {
    id: string;
    label: string;
    imageUrl: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Color {
  id: string;
  name: string;
  value: string;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Size {
  id: string;
  name: string;
  value: string;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Image {
  id: string;
  url: string;
  productId: string;
  variationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  categoryId: string;
  isFeatured: boolean;
  isArchived: boolean;
  storeId: string;
  category?: Category | null;
  images: Image[];
  variations: {
    id: string;
    colorId: string;
    sizeId: string;
    stock: number;
    color: Color;
    size: Size;
    images: Image[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const formSchema = z.object({
  name: z.string().min(1, 'Le champ doit contenir au moins un caractère.'),
  description: z.string().optional(),
  images: z.array(
    z.object({
      url: z.string(),
      variationId: z.string().nullable()
    })
  ),
  price: z.number().min(0, 'Le prix ne peut pas être négatif.'),
  categoryId: z.string().min(1, 'Veuillez sélectionner une catégorie.'),
  isFeatured: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  variations: z.array(
    z.object({
      id: z.string().optional(),
      colorId: z.string().min(1, 'Veuillez sélectionner une couleur.'),
      sizeId: z.string().min(1, 'Veuillez sélectionner une taille.'),
      stock: z.number().min(0, 'Le stock ne peut pas être négatif.'),
      images: z.array(
        z.object({
          url: z.string(),
          variationId: z.string().nullable()
        })
      )
    })
  )
});

export const ProductForm = ({
  initialData,
  categories,
  colors,
  sizes,
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description ?? undefined,
      price: parseFloat(String(initialData.price)),
      categoryId: initialData.categoryId,
      images: initialData.images?.map(img => ({
        url: img.url,
        variationId: null
      })) || [],
      isFeatured: initialData.isFeatured,
      isArchived: initialData.isArchived,
      variations: initialData.variations?.map(variation => ({
        id: variation.id,
        colorId: variation.colorId,
        sizeId: variation.sizeId,
        stock: variation.stock,
        images: variation.images?.map(img => ({
          url: img.url,
          variationId: variation.id
        })) || []
      })) || []
    } : {
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      images: [],
      isFeatured: false,
      isArchived: false,
      variations: []
    }
  });

  // ... Reste du composant
};
```

## 2. Images Upload Component
**Chemin**: `/components/ui/images-upload.tsx`

```typescript
import React, { useCallback, useState } from 'react';
import Script from 'next/script';
import { Trash, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from "react-hot-toast";

interface ImageType {
  url: string;
  variationId: string | null;
}

interface CloudinaryUploadWidgetOptions {
  cloudName: string;
  uploadPreset: string;
  multiple?: boolean;
  maxFiles?: number;
  folder?: string;
  resourceType?: string;
  cropping?: boolean;
  clientAllowedFormats?: string[];
  showUploadMoreButton?: boolean;
  singleUploadAutoClose?: boolean;
}

interface ImagesUploadProps {
  disabled?: boolean;
  onChange: (images: string[]) => void;
  onRemove?: (url: string) => void;
  value: string[] | ImageType[];
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

const ImagesUpload: React.FC<ImagesUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value = [],
  onUploadStart,
  onUploadEnd
}) => {
  const normalizedValue = (value || []).map(v => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.url || '';
  }).filter(Boolean);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // ... Reste du composant
};

export default ImagesUpload;
```

## 3. API Route
**Chemin**: `/app/api/[storeId]/products/[productId]/route.ts`

```typescript
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, productId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    
    const {
      name,
      description,
      price,
      categoryId,
      images,
      isFeatured,
      isArchived,
      variations
    } = body;

    if (!userId) {
      return new NextResponse("Non authentifié", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Le nom est requis", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Au moins une image est requise", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Le prix est requis", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("La catégorie est requise", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Non autorisé", { status: 403 });
    }

    // Mise à jour du produit
    const product = await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        name,
        description,
        price,
        categoryId,
        images: {
          deleteMany: {},
          createMany: {
            data: images.map((image: { url: string }) => ({
              url: image.url,
              variationId: null
            }))
          }
        },
        isFeatured,
        isArchived,
        variations: {
          deleteMany: {},
          createMany: {
            data: variations.map((variation: any) => ({
              colorId: variation.colorId,
              sizeId: variation.sizeId,
              stock: variation.stock,
              images: {
                createMany: {
                  data: variation.images.map((image: { url: string }) => ({
                    url: image.url,
                    variationId: variation.id
                  }))
                }
              }
            }))
          }
        }
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_PATCH]', error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
```

## 4. Routes API

### Route Principale des Produits
**Chemin**: `/app/api/[storeId]/products/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '../../../../lib/prismadb'

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()

    const {
      name,
      description,
      price,
      categoryId,
      variations,
      images,
      isFeatured,
      isArchived,
    } = body

    if (!userId) {
      return new NextResponse('Non autorisé', { status: 401 })
    }

    if (
      !name ||
      !description ||
      !price ||
      !categoryId ||
      !images ||
      !images.length
    ) {
      return new NextResponse('Les champs nom, description, prix, catégorie et images sont obligatoires', {
        status: 400,
      })
    }

    const product = await prismadb.product.create({
      data: {
        name,
        description,
        price,
        isFeatured,
        isArchived,
        categoryId,
        storeId: params.storeId,
        images: {
          createMany: {
            data: images.map((image: { url: string }) => ({ url: image.url })),
          },
        },
        ...(variations && variations.length > 0 && {
          variations: {
            createMany: {
              data: variations.map((variation: { colorId: string, sizeId: string, stock: number }) => ({
                colorId: variation.colorId,
                sizeId: variation.sizeId,
                stock: variation.stock
              }))
            }
          }
        })
      },
      include: {
        variations: {
          include: {
            color: true,
            size: true
          }
        },
        category: true,
        images: true
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.log('[PRODUCTS_POST]', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId') || undefined
    const colorId = searchParams.get('colorId') || undefined
    const sizeId = searchParams.get('sizeId') || undefined
    const isFeatured = searchParams.get('isFeatured')

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        variations: colorId || sizeId ? {
          some: {
            ...(colorId ? { colorId } : {}),
            ...(sizeId ? { sizeId } : {})
          }
        } : undefined,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
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

    return NextResponse.json(products)
  } catch (error) {
    console.log('[PRODUCTS_GET]', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
}
```

### Route de Produit Individuel
**Chemin**: `/app/api/[storeId]/products/[productId]/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '../../../../../lib/prismadb'

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse('Product ID is required', { status: 400 })
    }

    const product = await prismadb.product.findUnique({
      where: { 
        id: params.productId,
        storeId: params.storeId
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
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('🚨 Single Product GET Error:', error)
    return new NextResponse('Failed to fetch product', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()

    const {
      name,
      description,
      price,
      categoryId,
      variations,
      images,
      isFeatured,
      isArchived,
    } = body

    if (!userId) {
      return new NextResponse('Non autorisé', { status: 401 })
    }

    // Supprimer les variations existantes si de nouvelles variations sont fournies
    if (variations) {
      await prismadb.productVariation.deleteMany({
        where: {
          productId: params.productId
        }
      });
    }

    const updatedProduct = await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        description,
        price,
        categoryId,
        images: {
          deleteMany: {},
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
        ...(variations && variations.length > 0 && {
          variations: {
            createMany: {
              data: variations.map((variation: { colorId: string, sizeId: string, stock: number }) => ({
                colorId: variation.colorId,
                sizeId: variation.sizeId,
                stock: variation.stock
              }))
            }
          }
        }),
        isFeatured,
        isArchived,
      },
      include: {
        images: true,
        category: true,
        variations: {
          include: {
            size: true,
            color: true
          }
        }
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.log('[PRODUCT_PATCH]', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
}
```

## Problème et Solution

### Problème Initial
1. Les images ne s'affichaient pas correctement dans les variations
2. Incompatibilité de types entre le formulaire et l'API
3. Structure incohérente des données d'images

### Solution Mise en Place
1. Normalisation des données d'images :
   ```typescript
   images: initialData.images?.map(img => ({
     url: img.url,
     variationId: null
   })) || []
   ```

2. Gestion cohérente des types :
   ```typescript
   interface ImageType {
     url: string;
     variationId: string | null;
   }
   ```

3. Validation stricte avec Zod :
   ```typescript
   images: z.array(
     z.object({
       url: z.string(),
       variationId: z.string().nullable()
     })
   )
   ```

4. Traitement correct des images de variations :
   ```typescript
   variations: initialData.variations?.map(variation => ({
     id: variation.id,
     colorId: variation.colorId,
     sizeId: variation.sizeId,
     stock: variation.stock,
     images: variation.images?.map(img => ({
       url: img.url,
       variationId: variation.id
     })) || []
   }))
   ```

### Routes API Concernées

1. `GET /api/[storeId]/products/[productId]`
   - Récupère les détails d'un produit avec ses images

2. `PATCH /api/[storeId]/products/[productId]`
   - Met à jour un produit et ses images

3. `POST /api/[storeId]/products`
   - Crée un nouveau produit avec ses images
