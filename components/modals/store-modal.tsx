'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useStoreModal } from '@/hooks/use-store-modal'
import { Modal } from '@/components/ui/modal'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const formSchema = z.object({
  name: z.string().min(1, 'Le champ doit contenir au moins 1 caractère.'),
  address: z.string().min(1, 'Le champ adresse est obligatoire.'),
})

export const StoreModal = () => {
  const storeModal = useStoreModal()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await axios.post('/api/stores', values)

      window.location.assign(`/${response.data.id}`)
    } catch (error) {
      toast.error('Quelque chose s’est mal passé. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Créer une boutique"
      description="Ajouter une nouvelle boutique pour gérer les produits et les catégories"
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
    >
      <div>
        <div className="space-y-4 py-2 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="E-commerce"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Adresse complète"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                <Button
                  disabled={loading}
                  variant="outline"
                  onClick={storeModal.onClose}
                >
                  Annuler
                </Button>
                <Button disabled={loading} type="submit">
                  Continuer
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Modal>
  )
}
