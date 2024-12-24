// cloudinary.d.ts
interface Cloudinary {
  createUploadWidget: (
    options: { cloudName: string; uploadPreset: string },
    callback: (
      error: any,
      result: { event: string; info: { secure_url: string } }
    ) => void
  ) => {
    open: () => void
  }
}

interface Window {
  cloudinary: Cloudinary
}
