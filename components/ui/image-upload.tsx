'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/use-image-upload';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  className?: string;
  disabled?: boolean;
}

interface ImageData {
  url: string;
  publicId: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [images, setImages] = useState<ImageData[]>(
    value.map((url) => ({
      url,
      publicId: extractPublicIdFromUrl(url),
    }))
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadImages, deleteImage, error } = useImageUpload();

  const handleFiles = useCallback(async (files: File[]) => {
    if (disabled || uploading) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) return;

    try {
      const uploadedImages = await uploadImages(filesToUpload);
      const newImages = uploadedImages.map((img) => ({
        url: img.url,
        publicId: img.publicId,
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onChange(updatedImages.map((img) => img.url));
    } catch (err) {
      console.error('Upload failed:', err);
    }
  }, [images, maxImages, uploadImages, onChange, disabled, uploading]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  }, [handleFiles]);

  const handleRemoveImage = useCallback(async (index: number) => {
    if (disabled) return;

    const imageToRemove = images[index];
    
    try {
      if (imageToRemove.publicId) {
        await deleteImage(imageToRemove.publicId);
      }
      
      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      onChange(updatedImages.map((img) => img.url));
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  }, [images, deleteImage, onChange, disabled]);

  const openFileDialog = useCallback(() => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploading]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary',
          images.length >= maxImages && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={images.length < maxImages ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || uploading || images.length >= maxImages}
        />

        <div className="flex flex-col items-center justify-center text-center">
          {uploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
          ) : (
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
          )}
          
          <p className="text-sm text-gray-600 mb-1">
            {uploading
              ? 'Uploading images...'
              : images.length >= maxImages
              ? `Maximum ${maxImages} images reached`
              : 'Drop images here or click to upload'
            }
          </p>
          
          <p className="text-xs text-gray-400">
            {images.length < maxImages && `${maxImages - images.length} slots remaining`}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-1 py-0.5 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Info */}
      <div className="text-xs text-gray-500">
        <p>• Supported formats: JPEG, PNG, WebP</p>
        <p>• Maximum file size: 10MB per image</p>
        <p>• Images will be automatically optimized</p>
      </div>
    </div>
  );
}

// Helper function to extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url: string): string {
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
      // Get everything after 'upload' and before the file extension
      const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
      const publicIdWithExtension = pathAfterUpload.split('/').pop() || '';
      return publicIdWithExtension.split('.')[0];
    }
    return '';
  } catch {
    return '';
  }
}