'use client';

import { Decimal } from '@prisma/client/runtime/library';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Plus } from 'lucide-react';
import clsx from 'clsx';
import { useFieldArray } from 'react-hook-form';

// Types personnalisés pour remplacer les types Prisma
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

interface ProductVariation {
  id: string;
  colorId: string;
  sizeId: string;
  stock: number;
  color: Color;
  size: Size;
  images: Image[];
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: Decimal;
  categoryId: string;
  isFeatured: boolean;
  isArchived: boolean;
  storeId: string;
  category?: Category | null;
  images: Image[];
  variations: ProductVariation[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProductFormValues {
  name: string;
  description: string;
  images: { url: string }[];
  price: number;
  categoryId: string;
  isFeatured: boolean;
  isArchived: boolean;
  variations: {
    id?: string;
    colorId: string;
    sizeId: string;
    stock: number;
    images: {
      url: string;
      variationId?: string;
    }[];
  }[];
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Le nom est requis."
  }),
  description: z.string().min(1, {
    message: "La description est requise."
  }),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(0),
  categoryId: z.string().min(1),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  variations: z.array(z.object({
    id: z.string().optional(),
    colorId: z.string(),
    sizeId: z.string(),
    stock: z.number(),
    images: z.array(z.object({ url: z.string(), variationId: z.string().optional() }))
  }))
});

interface ProductFormProps {
  initialData:
    | (Product & {
    images: Image[];
  })
    | null;
  categories: Category[];
  colors: Color[];
  sizes: Size[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
                                                          initialData,
                                                          categories,
                                                          colors,
                                                          sizes,
                                                        }) => {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagesUploaded, setImagesUploaded] = useState(false);
  const [open, setOpen] = useState(false);

  const title = initialData ? 'Modifier le produit' : 'Créer un produit';
  const description = initialData ? 'Modifier un produit' : 'Créer un nouveau produit';
  const toastMessage = initialData ? 'Produit mis à jour.' : 'Produit créé.';
  const action = initialData ? 'Sauvegarder' : 'Créer';

  const initialProduct = initialData ? {
    ...initialData,
    price: parseFloat(initialData.price.toString()),
  } : null;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || "",
      images: initialData.images.map(image => ({ url: image.url })),
      price: parseFloat(initialData.price.toString()),
      categoryId: initialData.categoryId,
      isFeatured: initialData.isFeatured,
      isArchived: initialData.isArchived,
      variations: initialData.variations.map(variation => ({
        id: variation.id,
        colorId: variation.colorId,
        sizeId: variation.sizeId,
        stock: variation.stock,
        images: variation.images.map(image => ({
          url: image.url,
          variationId: variation.id
        }))
      }))
    } : {
      name: '',
      description: '',
      images: [],
      price: 0,
      categoryId: '',
      isFeatured: false,
      isArchived: false,
      variations: []
    }
  });

  const { register, control, handleSubmit, watch, setValue, getValues } = form;

  const { fields, append, remove } = useFieldArray({
    name: "variations",
    control: form.control,
  });

  const [variations, setVariations] = useState<any[]>(
    initialData?.variations || [{ colorId: '', sizeId: '', stock: 0, images: [] }]
  );

  const availableColors = useMemo(() => {
    return colors.filter(color =>
      !variations.some(v => v.colorId === color.id) || color.id === form.getValues(`variations.${0}.colorId`)
    );
  }, [colors, variations]);

  const onAddVariation = useCallback(() => {
    const currentVariations = form.getValues("variations");
    const newVariation = {
      colorId: '',
      sizeId: '',
      stock: 0,
      images: []
    };
    
    form.setValue("variations", [...currentVariations, newVariation]);
  }, [form]);

  const currentCategory = categories.find(c => c.id === form.watch('categoryId'));
  const currentColor = variations[0]?.colorId 
    ? colors.find(c => c.id === variations[0].colorId)
    : null;

  useEffect(() => {
    if (initialData) {
      console.log('Données initiales:', {
        variations: initialData.variations,
        images: initialData.images,
        formValues: form.getValues()
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      console.log('Données du produit:', {
        product: initialData,
        currentCategory: currentCategory?.name || 'Aucune catégorie trouvée',
        currentColor: currentColor?.value || 'Aucune couleur trouvée',
        images: initialData.images,
        variations: initialData.variations
      });
    }
  }, [initialData, currentCategory, currentColor]);

  useEffect(() => {
    if (initialData && initialData.images?.length > 0 && !currentColor) {
      console.log('Images existantes sans couleur, sélection nécessaire:', {
        images: initialData.images,
        availableColors: colors
      });
    }
  }, [initialData, currentColor, colors]);

  useEffect(() => {
    console.log('Variations actuelles:', {
      initialData: initialData?.variations,
      formVariations: form.watch('variations'),
      fields
    });
  }, [initialData, fields, form]);

  useEffect(() => {
    // Log pour déboguer les images
    if (initialData) {
      const formValues = form.getValues();
      console.log('Images debug:', {
        productImages: initialData.images,
        firstVariationImages: formValues.variations[0]?.images,
        allVariations: formValues.variations
      });
    }
  }, [initialData, form]);

  const onImageUpload = async (img: { url: string }) => {
    try {
      setUploading(true);
      const uploadedImage = { url: img.url, variationId: null };
      
      const currentImages = form.getValues('images') || [];
      form.setValue('images', [...currentImages, uploadedImage], {
        shouldValidate: true,
        shouldDirty: true
      });
      
      toast.success('Image téléchargée avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      toast.error('Échec du téléchargement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      
      // Vérifier que chaque variation a une couleur et une taille
      if (data.variations.some(v => !v.colorId || !v.sizeId)) {
        toast.error("Chaque variation doit avoir une couleur et une taille");
        return;
      }

      const formattedVariations = data.variations.map(variation => ({
        // Si l'ID est temporaire (commence par 'temp-'), on ne l'envoie pas à l'API
        ...(variation.id && !variation.id.startsWith('temp-') ? { id: variation.id } : {}),
        colorId: variation.colorId,
        sizeId: variation.sizeId,
        stock: Number(variation.stock),
        images: variation.images.map(img => ({
          url: typeof img === 'string' ? img : img.url,
          // On ne transmet pas le variationId temporaire à l'API
          ...(img.variationId && !img.variationId.startsWith('temp-') ? { variationId: img.variationId } : {})
        }))
      }));

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/products/${params.productId}`, {
          ...data,
          price: parseFloat(String(data.price)),
          variations: formattedVariations
        });
      } else {
        await axios.post(`/api/${params.storeId}/products`, {
          ...data,
          price: parseFloat(String(data.price)),
          variations: formattedVariations
        });
      }
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error('Une erreur est survenue.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success('Produit supprimé.');
    } catch (error) {
      toast.error('Une erreur est survenue.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal 
        isOpen={open} 
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-1 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Nom du produit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Prix</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={loading} placeholder="9.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Catégorie</FormLabel>
                    <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue defaultValue={field.value} placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea disabled={loading} placeholder="Description du produit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Variations</h2>
              <Button
                type="button"
                onClick={onAddVariation}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white transition-colors"
                size="sm"
                disabled={loading || availableColors.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une variation
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-8 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">
                    {index === 0 ? "Variation principale" : `Variation ${index + 1}`}
                  </h3>
                  {index !== 0 && (
                    <Button
                      type="button"
                      onClick={() => {
                        const currentVariations = form.getValues("variations");
                        form.setValue(
                          "variations",
                          currentVariations.filter((_, i) => i !== index)
                        );
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <FormField
                    control={form.control}
                    name={`variations.${index}.colorId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Couleur</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                defaultValue={field.value}
                                placeholder="Sélectionner une couleur"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {index === 0 
                              ? colors.map((color) => (
                                  <SelectItem
                                    key={color.id}
                                    value={color.id}
                                  >
                                    {color.name}
                                  </SelectItem>
                                ))
                              : colors
                                  .filter(
                                    (color) =>
                                      !variations.some(
                                        (v, i) => i !== index && v.colorId === color.id
                                      )
                                  )
                                  .map((color) => (
                                    <SelectItem
                                      key={color.id}
                                      value={color.id}
                                    >
                                      {color.name}
                                    </SelectItem>
                                  ))
                            }
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variations.${index}.sizeId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taille</FormLabel>
                        <Select 
                          disabled={loading} 
                          onValueChange={field.onChange} 
                          value={field.value} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue defaultValue={field.value} placeholder="Sélectionner une taille" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sizes.map((size) => (
                              <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variations.${index}.stock`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            disabled={loading} 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            value={field.value || 0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`variations.${index}.images`}
                  render={({ field }) => {
                    // Récupérer ou générer l'ID de variation
                    let variationId = form.getValues(`variations.${index}.id`);
                    if (!variationId) {
                      // Si pas d'ID, on en crée un temporaire
                      variationId = `temp-${index}-${Date.now()}`;
                      form.setValue(`variations.${index}.id`, variationId);
                    }
                    console.log(`Variation ${index} ID:`, variationId);

                    // Extraire les URLs des images de manière sûre
                    const imageUrls = Array.isArray(field.value) 
                      ? field.value.map((img: any) => {
                          if (typeof img === 'string') return img;
                          return img?.url || '';
                        }).filter(url => url !== '')
                      : [];
                    
                    console.log(`Variation ${index} images:`, imageUrls);
                    
                    return (
                      <FormItem>
                        <FormLabel>Images</FormLabel>
                        <FormControl>
                          <ImagesUpload 
                            value={imageUrls}
                            disabled={loading}
                            onChange={(urls) => {
                              console.log('New image URLs:', urls);
                              
                              // Convertir les URLs en objets d'image
                              const newImages = urls.map(url => ({
                                url,
                                variationId
                              }));

                              console.log('Setting new images:', newImages);
                              field.onChange(newImages);
                            }}
                            onRemove={(urlToRemove) => {
                              console.log('Removing image:', urlToRemove);
                              const newImages = Array.isArray(field.value)
                                ? field.value.filter((img: any) => {
                                    const currentUrl = typeof img === 'string' ? img : img?.url;
                                    return currentUrl !== urlToRemove;
                                  })
                                : [];
                              console.log('Updated images after removal:', newImages);
                              field.onChange(newImages);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            ))}
          </div>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
