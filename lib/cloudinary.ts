import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (server-side only)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Cloudinary upload options for product images
export const productImageUploadOptions = {
  folder: 'products',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [
    {
      quality: 'auto:good',
      fetch_format: 'auto',
    },
  ],
  eager: [
    {
      width: 800,
      height: 800,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto',
    },
    {
      width: 400,
      height: 400,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto',
    },
    {
      width: 200,
      height: 200,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto',
    },
  ],
};

// Generate signature for secure uploads (server-side only)
export function generateSignature(params: Record<string, any>): string {
  return cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
}

// Helper function to delete image from Cloudinary (server-side only)
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
}