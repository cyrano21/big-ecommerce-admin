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
import toast from 'react-hot-toast';
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
import { VariationsForm } from "@/components/variations-form";

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
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const formSchema = z.object({
  name: z.string().min(1, 'Le champ doit contenir au moins un caractère.'),
  description: z.string().optional(),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1),
  categoryId: z.string().min(1),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

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

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [variations, setVariations] = useState(initialData?.variations || []);

  const title = initialData ? 'Modifier le produit' : 'Créer un produit';
  const description = initialData ? 'Modifier un produit' : 'Créer un nouveau produit';
  const toastMessage = initialData ? 'Produit mis à jour avec succès.' : 'Produit créé avec succès.';
  const action = initialData ? 'Enregistrer les modifications' : 'Créer';

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
        name: initialData.name,
        description: initialData.description ?? undefined,
        images: initialData.images.map(img => ({ url: img.url })),
        price: parseFloat(String(initialData.price)),
        categoryId: initialData.categoryId,
        isFeatured: initialData.isFeatured,
        isArchived: initialData.isArchived,
      }
      : {
        name: '',
        description: undefined,
        images: [],
        price: 0,
        categoryId: '',
        isFeatured: false,
        isArchived: false,
      },
  });

  const onImageUpload = async (img: { url: string }) => {
    try {
      setUploading(true);
      const response = await axios.post(`/api/${params.storeId}/upload`, { url: img.url });
      const uploadedImage = { url: response.data.url };
      
      const currentImages = form.getValues('images') || [];
      form.setValue('images', [...currentImages, uploadedImage], {
        shouldValidate: true,
        shouldDirty: true
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Échec du téléchargement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    console.log('Initial form values:', {
      name: form.getValues('name'),
      images: form.getValues('images'),
      initialData: initialData
    });
  }, []);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      const formData = {
        ...data,
      };

      if (initialData) {
        // Mettre à jour le produit
        await axios.patch(`/api/${params.storeId}/products/${params.productId}`, formData);
        
        // Mettre à jour les variations
        await axios.post(`/api/${params.storeId}/products/${params.productId}/variations`, {
          variations: variations.map(v => ({
            colorId: v.colorId,
            sizeId: v.sizeId,
            stock: v.stock ? parseInt(String(v.stock)) : 0
          }))
        });
      } else {
        await axios.post(`/api/${params.storeId}/products`, formData);
      }

      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error('Une erreur est survenue.');
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
      toast.success('Le produit a été supprimée.', {
        icon: '👍',
        className: 'toast-success',
        duration: 3000,
      });
    } catch (error) {
      toast.error("Quelque chose s'est mal passé.");
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
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className={'w-4 h-4'} />
          </Button>
        )}
      </div>
      <Separator className="my-4" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">Images</FormLabel>
                <ImagesUpload
                  value={field.value?.map((img) => img.url) || []}
                  onChange={(newUrls) => {
                    field.onChange(newUrls.map(url => ({ url })));
                  }}
                  onRemove={(urlToRemove) => {
                    field.onChange(
                      field.value?.filter(img => img.url !== urlToRemove) || []
                    );
                  }}
                  onUploadStart={() => setUploading(true)}
                  onUploadEnd={() => setUploading(false)}
                  disabled={uploading}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Nom du produit"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description du produit"
                      {...field}
                      className="resize-y min-h-[100px] leading-relaxed"
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="9.99"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
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
                          placeholder="Selectionner une catégorie"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator />
          <div className="grid gap-8 mb-8">
            <VariationsForm
              productId={initialData?.id || ''}
              storeId={Array.isArray(params.storeId) ? params.storeId[0] : params.storeId}
              sizes={sizes}
              colors={colors}
              initialVariations={variations}
              onSuccess={(newVariations) => {
                setVariations(newVariations);
              }}
            />
          </div>
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    style={{ border: '1px solid #333' }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>En vedette</FormLabel>
                  <FormDescription>
                    Ce produit apparaîtra sur la page d&apos;accueil
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isArchived"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    style={{ border: '1px solid #333' }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Masqué</FormLabel>
                  <FormDescription>
                    ce produit n&apos;apparaîtra nulle part dans la boutique.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <Button 
            disabled={loading || uploading} 
            className="ml-auto" 
            type="submit"
          >
            {action}
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  );
};
