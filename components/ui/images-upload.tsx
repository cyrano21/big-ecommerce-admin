import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { Trash } from 'lucide-react';
import Image from 'next/image';
import { Button } from './button';

const ImagesUpload = ({
  value: initialValue = [],
  onChange,
  onRemove,
  onUploadStart,
  onUploadEnd,
  disabled = false,
}: {
  value?: string[];
  onChange: (urls: string[]) => void;
  onRemove?: (url: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  disabled?: boolean;
}) => {
  const [images, setImages] = useState<string[]>(initialValue);

  useEffect(() => {
    console.log('ImagesUpload - Initial value received:', {
      initialValue,
      currentImages: images
    });
    setImages(initialValue);
  }, [initialValue]);

  const handleSuccess = (newUrls: string[]) => {
    const uniqueNewUrls = newUrls.filter(url => !images.includes(url));
    const updatedImages = [...images, ...uniqueNewUrls];
    
    setImages(updatedImages);
    onChange(updatedImages);
    onUploadEnd?.();
  };

  const openCloudinaryWidget = () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'default_cloud_name';
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'default_upload_preset';

    if (!cloudName || !uploadPreset) {
      console.error('Cloudinary configuration is missing!');
      return;
    }

    onUploadStart?.();

    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        multiple: true,
        maxFiles: 5,
        folder: 'products',
        resourceType: 'image',
        cropping: false,
      },
      (error: any, result: { event: string; info: { secure_url: string } | { secure_url: string }[] }) => {
        console.log('Cloudinary upload result:', result);
        
        if (!error && result && result.event === 'success') {
          // Gère le cas où plusieurs fichiers sont uploadés simultanément
          const uploadedUrls = Array.isArray(result.info) 
            ? result.info.map(item => item.secure_url)
            : [result.info.secure_url];
          
          console.log('Uploaded URLs:', uploadedUrls);
          
          // Filtrer les URLs déjà existantes
          const newUrls = uploadedUrls.filter(url => !images.includes(url));
          
          console.log('New URLs to add:', newUrls);
          
          // Ajouter les nouvelles URLs à l'état existant
          const updatedImages = [...images, ...newUrls];
          
          console.log('Updated images:', updatedImages);
          
          // Mettre à jour l'état local et appeler onChange
          setImages(updatedImages);
          onChange(updatedImages);
        } else if (result && result.event === 'queues-end') {
          // Événement final de l'upload multiple
          onUploadEnd?.();
        } else if (result && result.event === 'close') {
          onUploadEnd?.();
        } else if (error) {
          console.error('Upload error:', error);
          onUploadEnd?.();
        }
      }
    );
    myWidget.open();
  };

  const handleRemove = (urlToRemove: string) => {
    const updatedImages = images.filter(url => url !== urlToRemove);
    setImages(updatedImages);
    onChange(updatedImages);
    onRemove?.(urlToRemove);
  };

  return (
    <>
      <Script
        src="https://widget.cloudinary.com/v2.0/global/all.js"
        strategy="lazyOnload"
        onLoad={() => console.log('Cloudinary script loaded!')}
      />
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-start">
        {console.log('Images value:', images)}
        {images.map((url, index) => (
          <div
            key={index}
            className="group relative w-full max-w-[300px] h-[300px] rounded-lg overflow-hidden shadow-lg"
          >
            <Image
              fill
              src={url}
              alt="Uploaded"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                console.error('Image failed to load:', url);
                e.currentTarget.style.display = 'none';
              }}
              className="object-contain"
              quality={75}
            />
            <button
              className="absolute top-0 right-0 p-2 transition-opacity opacity-0 group-hover:opacity-100"
              onClick={() => handleRemove(url)}
              style={{ backgroundColor: 'rgba(255,0,0,0.8)' }}
            >
              <Trash className="w-5 h-5 text-white" />
            </button>
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
  );
};

export default ImagesUpload;
