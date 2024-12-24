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
import { Color } from '@prisma/client'

const formSchema = z.object({
  name: z.string().min(1, 'Le champ doit contenir au moins un caractère.'),
  value: z.string().min(4).regex(/^#/, {
    message: 'La chaine doit être un code couleur hexadécimal valide.',
  }),
})

type ColorFormValues = z.infer<typeof formSchema>

interface ColorFormProps {
  initialData: Color | null
}

export const ColorForm: React.FC<ColorFormProps> = ({ initialData }) => {
  const params = useParams()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const title = initialData ? 'Modifier la couleur' : 'Créer une couleur'
  const description = initialData
    ? 'Modifier une couleur'
    : 'Créer une nouvelle couleur'
  const toastMessage = initialData
    ? 'Mise à jour de la couleur.'
    : 'nouvelle couleur créée.'
  const action = initialData ? 'Enregistrer les modifications' : 'Créer'

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      value: '',
    },
  })

  const onSubmit = async (data: ColorFormValues) => {
    setLoading(true)
    let endpoint = initialData
      ? `/api/${params.storeId}/colors/${params.colorId}`
      : `/api/${params.storeId}/colors`
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
            ? 'Couleur mise à jour avec succès.'
            : 'Nouvelle couleur créée avec succès.'),
        {
          icon: '👍',
          duration: 3000,
          style: { backgroundColor: 'green', color: 'white' },
        }
      )
      setTimeout(() => {
        router.push(`/${params.storeId}/colors?update=${Date.now()}`)
      }, 900)
    } catch (error: unknown) {
      // Specify that error is of type unknown
      toast.dismiss(toastId)
      let errorMessage = "Erreur lors de l'enregistrement."
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
      await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`)
      await toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
        loading: 'Suppression en cours...',
        success: () => {
          const message = 'La couleur supprimée.'
          toast.success(message, {
            icon: '👍',
            className: 'toast-success',
            duration: 2000,
          })
          router.push(`/${params.storeId}/colors`)
          return message
        },
        error:
          'Assurez-vous d’avoir d’abord supprimé tous les produits et toutes les couleurs.',
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
                      placeholder="Le nom de la couleur"
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
                    <div className="flex items-center gap-x-4">
                      <Input
                        disabled={loading}
                        placeholder="#000000"
                        {...field}
                      />
                      <input 
                        type="color" 
                        value={field.value} 
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                        className="w-16 h-10 cursor-pointer"
                        title="Sélectionnez une couleur"
                      />
                      <div 
                        className="w-10 h-10 rounded-full border" 
                        style={{ backgroundColor: field.value }}
                        title="Prévisualisation de la couleur"
                      />
                    </div>
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
