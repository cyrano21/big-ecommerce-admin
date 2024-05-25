'use client'

import React, { useState } from 'react'

import * as z from 'zod'
import { Store } from '@prisma/client'
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
import { ApiAlert } from '@/components/ui/api-alert'
import { useOrigin } from '@/hooks/use-origin'

interface SettingsFormProps {
  initialData: Store
}

const formSchema = z.object({
  name: z.string().min(1, 'Le champ doit contenir au moins un caractère.'), // Message personnalisé en français
})

type SettingsFormValues = z.infer<typeof formSchema>

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const params = useParams()
  const router = useRouter()
  const origin = useOrigin()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true)
      await axios.patch(`/api/stores/${params.storeId}`, data)
      toast
        .promise(
          new Promise((resolve) => setTimeout(resolve, 3000)), // Simulez un délai pour l'API
          {
            loading: 'Enregistrement en cours...',
            success: () => {
              return toast.success(
                'Les modifications ont été enregistrées avec succès.',
                {
                  icon: '👍',
                  className: 'toast-success',
                  duration: 3000,
                }
              )
            },
            error: 'Quelque chose s’est mal passé.',
          }
        )
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
      router.refresh() // Considérez à déplacer ici si vous voulez toujours rafraîchir après l'action.
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/stores/${params.storeId}`)
      router.refresh()
      router.push('/')
      toast.success('La boutique a été supprimée.', {
        icon: '👍',
        className: 'toast-success',
        duration: 3000,
      })
      router.push('/')
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
        <Heading
          title="Paramètres"
          description="Gérer les préférences de la boutique"
        />
        <Button
          disabled={loading}
          variant="destructive"
          size="icon"
          onClick={() => setOpen(true)}
        >
          <Trash className={'w-4 h-4'} />
        </Button>
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
                      placeholder="Nom de la boutique"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            Enregistrer les modifications
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        description={`${origin}/api/${params.storeId}`}
        variant="public"
      />
    </>
  )
}
