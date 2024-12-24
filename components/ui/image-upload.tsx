'use client'
import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import Image from 'next/image'
import { CldUploadWidget } from 'next-cloudinary'

interface ImageUploadProps {
  disabled?: boolean
  onChange: (value: string) => void // Gestion des changements d'image
  onRemove: () => void // Gestion de la suppression de l'image
  value: string // URL de l'image
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = React.useState(false)

  useEffect(() => {
    setIsMounted(true) // Assurez-vous que le composant est monté avant de rendre
  }, [])

  const onUpload = (result: any) => {
    if (result.event === 'success') {
      onChange(result.info.secure_url) // Mise à jour de l'URL de l'image après le téléchargement
    }
  }

  if (!isMounted) {
    return null // Rendre null pendant que le composant n'est pas encore monté
  }

  return (
    <div className="mb-4">
      <div className="relative w-[500px] h-[300px] rounded-md overflow-hidden group">
        {value ? (
          <>
            <Image
              fill
              src={value}
              alt="Image téléchargée"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover w-full h-full"
              priority
            />
            <Button
              type="button"
              disabled={disabled}
              className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 border border-red-500 text-white"
              onClick={onRemove}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <div className="bg-gray-200 flex items-center justify-center text-gray-500">
            Pas d&apos;image chargée
          </div>
        )}
      </div>

      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        onUpload={onUpload}
      >
        {({ open }) => (
          <Button
            type="button"
            disabled={disabled}
            variant="secondary"
            onClick={(event) => {
              event.preventDefault()
              open()
            }}
            className="mt-2"
          >
            Charger une image
          </Button>
        )}
      </CldUploadWidget>
    </div>
  )
}

export default ImageUpload
