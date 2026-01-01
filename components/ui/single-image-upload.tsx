'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/use-image-upload';
import { extractPublicIdFromUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SingleImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function SingleImageUpload({
  value,
  onChange,
  className,
  disabled = false,
  placeholder = "Upload image"
}: SingleImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadImages, deleteImage, error } = useImageUpload();

  const handleFiles = useCallback(async (files: File[]) => {
    if (disabled || uploading || files.length === 0) return;

    try {
      const uploadedImages = await uploadImages([files[0]]);
      if (uploadedImages.length > 0) {
        onChange(uploadedImages[0].url);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  }, [uploadImages, onChange, disabled, uploading]);

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
      handleFiles([e.dataTransfer.files[0]]);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles([e.target.files[0]]);
    }
  }, [handleFiles]);

  const handleRemove = useCallback(async () => {
    if (!value) return;
    
    try {
      // Extract public ID from Cloudinary URL for deletion
      const publicId = extractPublicIdFromUrl(value);
      if (publicId) {
        await deleteImage(publicId);
      }
      onChange(undefined);
    } catch (err) {
      console.error('Delete failed:', err);
      // Still remove from UI even if deletion fails
      onChange(undefined);
    }
  }, [value, deleteImage, onChange]);

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative group">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={value}
              alt="Category image"
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed",
            "w-32 h-32 flex flex-col items-center justify-center"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          ) : (
            <>
              <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">{placeholder}</span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}