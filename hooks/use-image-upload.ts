import { useState, useCallback } from 'react';

interface UploadedImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  eager?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}

interface UseImageUploadReturn {
  uploading: boolean;
  uploadImages: (files: File[]) => Promise<UploadedImage[]>;
  deleteImage: (publicId: string) => Promise<void>;
  error: string | null;
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = useCallback(async (files: File[]): Promise<UploadedImage[]> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }

      return data.images;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload images';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  }, []);

  const deleteImage = useCallback(async (publicId: string): Promise<void> => {
    setError(null);

    try {
      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete image');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete image';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    uploading,
    uploadImages,
    deleteImage,
    error,
  };
}