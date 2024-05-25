'use client'

import React from 'react'
import Script from 'next/script'

import { Trash } from 'lucide-react'
import Image from 'next/image'
import { Button } from './button'

interface ImageUploadProps {
  disabled?: boolean
  onChange: (urls: string[]) => void
  onRemove: (url: string) => void
  value: string[]
}

const ImagesUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const handleSuccess = (info: { secure_url: string }) => {
    onChange([...value, info.secure_url])
  }

  const openCloudinaryWidget = () => {
    // Assurer que les valeurs pour cloudName et uploadPreset sont toujours définies
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'default_cloud_name'
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      'default_upload_preset'

    if (!cloudName || !uploadPreset) {
      console.error('Cloudinary configuration is missing!')
      return
    }

    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
      },
      (error: any, result: { event: string; info: { secure_url: string } }) => {
        if (!error && result && result.event === 'success') {
          handleSuccess(result.info)
        }
      }
    )
    myWidget.open()
  }

  return (
    <>
      <Script
        src="https://widget.cloudinary.com/v2.0/global/all.js"
        strategy="lazyOnload"
        onLoad={() => console.log('Cloudinary script loaded!')}
      />
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-start">
        {value.map((url, index) => (
          <div
            key={index}
            className="group relative w-32 h-32 rounded-lg overflow-hidden shadow-lg"
          >
            <Image
              layout="fill"
              src={url}
              alt="Uploaded"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <Button
              className="absolute top-0 right-0 p-2 transition-opacity opacity-0 group-hover:opacity-100"
              onClick={() => onRemove(url)}
              style={{ backgroundColor: 'rgba(255,0,0,0.8)' }}
            >
              <Trash className="w-5 h-5 text-white" />
            </Button>
          </div>
        ))}
        <Button
          disabled={disabled}
          onClick={openCloudinaryWidget}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Upload Image
        </Button>
      </div>
    </>
  )
}

export default ImagesUpload
