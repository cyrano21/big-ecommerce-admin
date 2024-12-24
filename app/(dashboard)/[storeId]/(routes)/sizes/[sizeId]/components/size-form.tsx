'use client'

import React, { useState } from 'react'

import * as z from 'zod'
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
import { Size } from '@prisma/client'

const formSchema = z.object({
  name: z.string().min(1, 'Le champ doit contenir au moins un caractère.'),
  value: z.string().min(1),
})

type SizeFormValues = z.infer<typeof formSchema>

interface SizeFormProps {
  initialData: Size | null
}

export const SizeForm: React.FC<SizeFormProps> = ({ initialData }) => {
  const params = useParams()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const title = initialData ? 'Modifier la taille' : 'Créer une taille'
  const description = initialData
    ? 'Modifier une taille'
    : 'Créer une nouvelle taille'
  const toastMessage = initialData
    ? 'Mise à jour de la taille.'
    : 'nouvelle taille créée.'
  const action = initialData ? 'Enregistrer les modifications' : 'Créer'

  const form = useForm<SizeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      value: '',
    },
  })

  const onSubmit = async (data: SizeFormValues) => {
    setLoading(true)
    let endpoint = initialData
      ? `/api/${params.storeId}/sizes/${params.sizeId}`
      : `/api/${params.storeId}/sizes`
    let method = initialData ? axios.patch : axios.post

    const delay = (ms: number | undefined) =>
      new Promise((res) => setTimeout(res, ms))

    const toastId = toast.loading('Enregistrement en cours...', {
      style: { backgroundColor: 'blue', color: 'white' },
    })

    try {
      const response = await Promise.all([method(endpoint, data), delay(2000)])
      const apiResponse = response[0]
      toast.dismiss(toastId)
      toast.success(
        apiResponse.data.message ||
        (initialData
          ? 'Taille mise à jour avec succès.'
          : 'Nouvelle taille créée avec succès.'),
        {
          icon: '👍',
          duration: 3000,
          style: { backgroundColor: 'green', color: 'white' },
        },
      )
      setTimeout(() => {
        router.push(`/${params.storeId}/sizes?update=${Date.now()}`)
      }, 900)
    } catch (error: unknown) {
      // Specify that error is of type unknown
      toast.dismiss(toastId)
      let errorMessage = 'Erreur lors de l\'enregistrement.'
      if (axios.isAxiosError(error)) {
        // Check if it is an Axios error
        if (error.response && error.response.data) {
          errorMessage = `Erreur rencontrée: ${error.response.data.message}`
        } else {
          errorMessage = `Erreur réseau ou de serveur non spécifiée.`
        }
      } else if (error instanceof Error) {
        // Check if it is a generic Error
        errorMessage = `Erreur rencontrée: ${error.message}`
      }
      toast.error(errorMessage, {
        style: { backgroundColor: 'red', color: 'white' },
      })
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/sizes/${params.sizeId}`)
      await toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
        loading: 'Suppression en cours...',
        success: () => {
          const message = 'La taille supprimée.'
          toast.success(message, {
            icon: '👍',
            className: 'toast-success',
            duration: 2000,
          })
          router.push(`/${params.storeId}/sizes`)
          return message
        },
        error:
          'Assurez-vous d’avoir d’abord supprimé tous les produits et toutes les tailles.',
      })
    } catch (error) {
      toast.error('Erreur rencontrée lors de la suppression.')
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
                  <FormLabel className="mb-2">Nom</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Le nom de la taille"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel className="mb-2">Valeur</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="La valeur de la taille"
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
