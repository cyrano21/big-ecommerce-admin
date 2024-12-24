'use client'

import React, { useState } from 'react'

import * as z from 'zod'
import { Billboard } from '@prisma/client'
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
import ImageUpload from '../../../../../../../components/ui/image-upload'

const formSchema = z.object({
  label: z.string().min(1, 'Le champ doit contenir au moins un caractère.'),
  imageUrl: z.string().min(1),
})

type BillboardFormValues = z.infer<typeof formSchema>

interface BillboardFormProps {
  initialData: Billboard | null
}

export const BillboardForm: React.FC<BillboardFormProps> = ({
  initialData,
}) => {
  const params = useParams()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const title = initialData
    ? "Modifier le panneau d'affichage"
    : 'Créer un panneau'
  const description = initialData
    ? "Modifier un  panneau d'affichage"
    : 'Créer un nouveau panneau'
  const toastMessage = initialData
    ? 'Mise à jour du panneau.'
    : "panneau d'affichage crée."
  const action = initialData ? 'Enregistrer les modifications' : 'Créer'

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: '',
      imageUrl: '',
    },
  })

  const onSubmit = async (data: BillboardFormValues) => {
    try {
      setLoading(true)
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/billboards/${params.billboardId}`,
          data
        )
      } else {
        await axios.post(`/api/${params.storeId}/billboards`, data)
      }
      router.refresh()
      router.push('/${params.storeId}/billboards')

      toast
        .promise(new Promise((resolve) => setTimeout(resolve, 3000)), {
          loading: 'Enregistrement en cours...',
          success: () => {
            return toast.success('Panneau enregistré avec succès.', {
              icon: '👍',
              className: 'toast-success',
              duration: 3000,
            })
          },
          error: 'Quelque chose s’est mal passé.',
        })
        .then(() => {
          router.refresh()
        })
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erreur lors de la requête API:', error)
        toast.error(`Erreur rencontrée: ${error.message}`)
      }
    } finally {
      setLoading(false)
      router.refresh()
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(
        `/api/${params.storeId}/billboards/${params.billboardId}`
      )
      router.refresh()
      router.push(`/${params.storeId}/billboards`)
      toast.success('La boutique a été supprimée.', {
        icon: '👍',
        className: 'toast-success',
        duration: 3000,
      })
    } catch (error) {
      toast.error(
        'Assurez-vous d’avoir d’abord supprimé tous les produits et toutes les catégories.'
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
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">Image d’arrière-plan</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || ''} // Assurez-vous que la valeur est une chaîne
                    disabled={loading}
                    onChange={(url: string) => field.onChange(url)}
                    onRemove={() => field.onChange('')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel className="mb-2">Étiquette</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Étiquette de panneau d’affichage"
                      {...field}
                    />
                  </FormControl>
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
