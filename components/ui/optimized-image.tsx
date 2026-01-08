'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getOptimizedImage, generateSrcSet, ImageTransformOptions } from '@/lib/image-utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  transformOptions?: ImageTransformOptions;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  sizes,
  transformOptions = {},
  fallbackSrc = '/placeholder-image.jpg',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get optimized image URL
  const optimizedSrc = getOptimizedImage(src, {
    width,
    height,
    quality: 'auto:good',
    format: 'auto',
    ...transformOptions,
  });

  // Generate srcSet for responsive images
  const srcSet = generateSrcSet(src);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const imageSrc = imageError ? fallbackSrc : optimizedSrc;

  if (fill) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <Image
          src={imageSrc}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          className={cn(
            'object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {isLoading && width && height && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

// Product image component with predefined sizes
interface ProductImageProps {
  src: string;
  alt: string;
  size?: 'thumbnail' | 'small' | 'medium' | 'large';
  className?: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  size = 'medium',
  className,
  priority = false,
}: ProductImageProps) {
  const sizeMap = {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
  };

  const { width, height } = sizeMap[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      transformOptions={{
        crop: 'fill',
        quality: 'auto:good',
      }}
    />
  );
}

// Product image gallery component
interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export function ProductImageGallery({
  images,
  productName,
  className,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={cn('aspect-square bg-gray-200 rounded-lg flex items-center justify-center', className)}>
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image */}
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
        <OptimizedImage
          src={images[selectedImage]}
          alt={`${productName} - Image ${selectedImage + 1}`}
          fill
          priority
          className="cursor-zoom-in"
          transformOptions={{
            crop: 'fill',
            quality: 'auto:good',
          }}
        />
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors',
                selectedImage === index
                  ? 'border-primary'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <OptimizedImage
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                width={64}
                height={64}
                transformOptions={{
                  crop: 'fill',
                  quality: 'auto:eco',
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}