'use client';

import React, { useState, useEffect } from 'react';
import * as z from 'zod';
import { Category, Color, Image, Product, Size } from '@prisma/client';
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

const formSchema = z.object({
  name: z.string().min(1, 'Le champ doit contenir au moins un caractère.'),
  description: z.string().optional(),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1),
  categoryId: z.string().min(1),
  colorId: z.string().min(1),
  sizeId: z.string().min(1),
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

  const title = initialData ? 'Modifier le produit' : 'Créer un produit';
  const description = initialData ? 'Modifier un produit' : 'Créer un nouveau produit';
  const toastMessage = initialData ? 'Produit mis à jour avec succès.' : 'Produit créé avec succès.';
  const action = initialData ? 'Enregistrer les modifications' : 'Créer';

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
        ...initialData,
        price: parseFloat(String(initialData?.price)),
      }
      : {
        name: '',
        description: '',
        images: [],
        price: 0,
        categoryId: '',
        colorId: '',
        sizeId: '',
        isFeatured: false,
        isArchived: false,
      },
  });

  useEffect(() => {
    console.log('Initial form values:', {
      name: form.getValues('name'),
      images: form.getValues('images'),
      initialData: initialData
    });
  }, []);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      console.log('Submitting form data:', {
        ...data,
        images: data.images.map(img => img.url)
      });

      setLoading(true);

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/products`, data);
      }

      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success(toastMessage);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Something went wrong.');
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
                  value={
                    form.getValues('images')?.map((img) => img.url) || 
                    initialData?.images?.map((img) => img.url) || 
                    []
                  }
                  onChange={(newUrls) => {
                    const currentImages = form.getValues('images') || [];
                    
                    // Créer de nouveaux objets image avec des URLs uniques
                    const newImages = newUrls
                      .filter(url => !currentImages.some(img => img.url === url))
                      .map(url => ({ 
                        url, 
                        id: crypto.randomUUID() 
                      }));

                    // Fusionner les images existantes et les nouvelles
                    const updatedImages = [
                      ...currentImages,
                      ...newImages
                    ];

                    console.log('Updating images:', {
                      currentImages,
                      newUrls,
                      updatedImages
                    });

                    form.setValue('images', updatedImages, { 
                      shouldValidate: true,
                      shouldDirty: true
                    });
                  }}
                  onRemove={(urlToRemove) => {
                    const currentImages = form.getValues('images') || [];
                    const updatedImages = currentImages.filter(
                      (img) => img.url !== urlToRemove
                    );

                    console.log('Removing image:', {
                      urlToRemove,
                      currentImages,
                      updatedImages
                    });

                    form.setValue('images', updatedImages, { 
                      shouldValidate: true,
                      shouldDirty: true
                    });
                  }}
                  onUploadStart={() => setUploading(true)}
                  onUploadEnd={() => setUploading(false)}
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
            <FormField
              control={form.control}
              name="sizeId"
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
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Selectionner une taille"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colorId"
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
                          placeholder="Selectionner une couleur"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          {color.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          </div>
          <Button disabled={loading || uploading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  );
};
