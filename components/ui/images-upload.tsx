import React, { useState, useEffect } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash } from 'lucide-react';
import Image from 'next/image';

interface ImagesUploadProps {
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const ImagesUpload: React.FC<ImagesUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value = []
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = (result: any) => {
    if (result?.info?.secure_url) {
      const newUrl = result.info.secure_url;
      console.log('Image URL from Cloudinary:', newUrl);
      
      // S'assurer que value est toujours un tableau
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = [...currentValue, newUrl];
      
      console.log('Updated image array:', newValue);
      onChange(newValue);
    } else {
      console.error('Failed to get secure_url from result:', result);
    }
  };

  if (!isMounted) {
    return null;
  }

  // S'assurer que value est toujours un tableau
  const safeValue = Array.isArray(value) ? value : [];
  console.log('Rendering images with values:', safeValue);

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {safeValue.map((url, index) => {
          if (!url) {
            console.warn('Undefined URL found at index:', index);
            return null;
          }

          return (
            <div
              key={`${url}-${index}`}
              className="relative w-[200px] h-[200px] rounded-lg overflow-hidden"
            >
              <div className="z-10 absolute top-2 right-2">
                <Button
                  type="button"
                  onClick={() => {
                    console.log('Removing image:', url);
                    onRemove(url);
                  }}
                  variant="destructive"
                  size="sm"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative w-full h-full">
                <Image
                  className="object-cover"
                  alt="Image"
                  src={url}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    console.error('Image failed to load:', url);
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.style.display = 'none';
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <CldUploadWidget 
        onUpload={onUpload}
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{
          maxFiles: 4,
          sources: ['local', 'url', 'camera'],
          multiple: true,
          clientAllowedFormats: ["png", "gif", "jpeg", "jpg", "webp"],
          maxFileSize: 10000000,
          showAdvancedOptions: false,
          cropping: false,
        }}
      >
        {({ open }) => {
          const onClick = () => {
            open();
          };

          return (
            <Button 
              type="button"
              disabled={disabled} 
              variant="secondary" 
              onClick={onClick}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Ajouter une image
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImagesUpload;
