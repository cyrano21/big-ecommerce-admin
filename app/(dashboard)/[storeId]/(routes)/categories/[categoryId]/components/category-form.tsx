'use client'

import React, { useState } from 'react'

import * as z from 'zod'
import { Billboard, Category } from '@prisma/client'
import { Trash } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Heading } from '@/components/ui/heading'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { AlertModal } from '@/components/modals/alert-modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  name: z.string().min(1, 'Le champ doit contenir au moins un caractère.'),
  billboardId: z.string().min(1),
})

type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
  initialData: Category | null
  billboards: Billboard[]
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  billboards,
}) => {
  const params = useParams()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const title = initialData ? 'Modifier la catégorie' : 'Créer une catégorie'
  const description = initialData
    ? 'Modifier une catégorie existante'
    : 'Ajouter une nouvelle catégorie'
  const toastMessage = initialData
    ? 'Mise à jour de la catégorie.'
    : 'catégorie crée.'
  const action = initialData ? 'Enregistrer les modifications' : 'Créer'

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      billboardId: '',
    },
  })

  const onSubmit = async (data: CategoryFormValues) => {
    const toastId = toast.loading('Enregistrement en cours...')
    try {
      setLoading(true)
      const url = `/api/${params.storeId}/categories/${initialData ? params.categoryId : ''}`
      const method = initialData ? axios.patch : axios.post

      await new Promise((resolve) => setTimeout(resolve, 2000))

      await method(url, data)

      toast.success(
        `${initialData ? 'Catégorie mise à jour avec succès.' : 'Catégorie créée avec succès.'}`,
        {
          id: toastId,
          icon: '🚀',
          duration: 2000,
          style: { backgroundColor: 'green', color: 'white' },
        }
      )

      router.push(`/${params.storeId}/categories`)
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erreur lors de la requête API:', error)
        toast.error(`Erreur rencontrée: ${error.message}`, {
          icon: '❌',
        })
      }
      toast.dismiss(toastId)
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(
        `/api/${params.storeId}/categories/${params.categoryId}`
      )
      router.refresh()
      router.push(`/${params.storeId}/categories`)
      toast.success('La catégorie a été supprimée.', {
        icon: '🚀',
        className: 'toast-success',
        duration: 2000,
      })
    } catch (error) {
      toast.error(
        "Assurez-vous de supprimer d'abord tous les produits utilisant cette catégorie."
      )
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

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
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Nom de la catégorie"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Panneau d&lsquo;affichage</FormLabel>
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
                          placeholder="Selectionner un panneau"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {billboards.map((billboard) => (
                        <SelectItem key={billboard.id} value={billboard.id}>
                          {billboard.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  )
}
