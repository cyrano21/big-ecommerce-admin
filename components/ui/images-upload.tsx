import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { Trash } from 'lucide-react';
import Image from 'next/image';
import { Button } from './button';

interface CloudinaryUploadWidgetOptions {
  cloudName: string;
  uploadPreset: string;
  multiple?: boolean;
  maxFiles?: number;
  folder?: string;
  resourceType?: string;
  cropping?: boolean;
}

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
      } as CloudinaryUploadWidgetOptions,
      (error: any, result: { event: string; info: { secure_url: string } | { secure_url: string }[] }) => {
        if (!error && result && result.event === 'success') {
          const uploadedUrls = Array.isArray(result.info) 
            ? result.info.map(item => item.secure_url)
            : [result.info.secure_url];
          
          const newUrls = [...images, ...uploadedUrls].slice(0, 5);
          setImages(newUrls);
          onChange(newUrls);
          
          if (onUploadEnd) {
            onUploadEnd();
          }
        } else if (result && result.event === 'queues-end') {
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
        onLoad={() => {}}
      />
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-start">
        {images.map((url, index) => (
          <div
            key={index}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button 
                type="button" 
                onClick={() => onRemove ? onRemove(url) : handleRemove(url)} 
                variant="destructive" 
                size="sm"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Product image"
              src={url}
            />
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
