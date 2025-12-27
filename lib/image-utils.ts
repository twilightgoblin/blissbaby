export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'limit' | 'mfit' | 'mpad';
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
}

// Predefined image sizes for different use cases
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
  hero: { width: 1920, height: 1080 },
} as const;

/**
 * Get optimized image URL from Cloudinary URL (client-side safe)
 */
export function getOptimizedImage(
  imageUrl: string,
  options: ImageTransformOptions = {}
): string {
  // Extract public ID from Cloudinary URL
  const publicId = extractPublicIdFromUrl(imageUrl);
  
  if (!publicId) {
    // If not a Cloudinary URL, return original
    return imageUrl;
  }

  return getOptimizedImageUrl(publicId, options);
}

/**
 * Generate optimized Cloudinary URL (client-side safe)
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: ImageTransformOptions = {}
): string {
  const {
    width = 800,
    height = 800,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto',
  } = options;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not set');
    return '';
  }

  // Build transformation string
  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformString = transformations.join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
}

/**
 * Get multiple optimized versions of an image
 */
export function getResponsiveImages(imageUrl: string) {
  const publicId = extractPublicIdFromUrl(imageUrl);
  
  if (!publicId) {
    return {
      thumbnail: imageUrl,
      small: imageUrl,
      medium: imageUrl,
      large: imageUrl,
    };
  }

  return {
    thumbnail: getOptimizedImageUrl(publicId, IMAGE_SIZES.thumbnail),
    small: getOptimizedImageUrl(publicId, IMAGE_SIZES.small),
    medium: getOptimizedImageUrl(publicId, IMAGE_SIZES.medium),
    large: getOptimizedImageUrl(publicId, IMAGE_SIZES.large),
  };
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string {
  try {
    // Handle Cloudinary URLs
    if (url.includes('cloudinary.com')) {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
        // Skip version if present (starts with 'v' followed by numbers)
        let startIndex = uploadIndex + 1;
        if (urlParts[startIndex] && /^v\d+$/.test(urlParts[startIndex])) {
          startIndex++;
        }
        
        // Get the path after upload (and version)
        const pathParts = urlParts.slice(startIndex);
        const fullPath = pathParts.join('/');
        
        // Remove file extension
        return fullPath.replace(/\.[^/.]+$/, '');
      }
    }
    
    return '';
  } catch {
    return '';
  }
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(imageUrl: string): string {
  const publicId = extractPublicIdFromUrl(imageUrl);
  
  if (!publicId) {
    return imageUrl;
  }

  const sizes = [
    { width: 400, descriptor: '400w' },
    { width: 600, descriptor: '600w' },
    { width: 800, descriptor: '800w' },
    { width: 1200, descriptor: '1200w' },
  ];

  return sizes
    .map(({ width, descriptor }) => 
      `${getOptimizedImageUrl(publicId, { width, quality: 'auto:good' })} ${descriptor}`
    )
    .join(', ');
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB',
    };
  }

  return { valid: true };
}

/**
 * Batch validate image files
 */
export function validateImageFiles(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  files.forEach((file, index) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      errors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}