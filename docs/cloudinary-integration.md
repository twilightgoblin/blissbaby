# Cloudinary Integration for Product Images

This document explains how to set up and use the Cloudinary integration for secure product image uploads with optimization and multiple image support.

## Features

- ✅ **Secure Upload**: Server-side signature generation for secure uploads
- ✅ **Image Optimization**: Automatic format conversion, quality optimization, and responsive images
- ✅ **Multiple Images**: Support for multiple product images with reordering
- ✅ **File Validation**: Client and server-side validation for file types and sizes
- ✅ **Responsive Images**: Automatic generation of multiple image sizes
- ✅ **Drag & Drop**: Intuitive drag-and-drop interface
- ✅ **Image Management**: Delete, reorder, and preview functionality

## Setup Instructions

### 1. Cloudinary Account Setup

1. Create a free account at [Cloudinary](https://cloudinary.com)
2. Go to your Dashboard to find your credentials:
   - Cloud Name
   - API Key
   - API Secret

### 2. Environment Variables

Update your `.env` file with your Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
CLOUDINARY_API_KEY="your_api_key_here"
CLOUDINARY_API_SECRET="your_api_secret_here"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
```

### 3. Database Schema

The Product model already supports multiple images with the `images` field as `String[]`:

```prisma
model Product {
  // ... other fields
  images      String[]  // Array of Cloudinary URLs
  // ... other fields
}
```

## API Routes

### Upload Images: `/api/upload/images`
- **Method**: POST
- **Body**: FormData with `files` field
- **Response**: Array of uploaded image data

### Generate Signature: `/api/upload/signature`
- **Method**: POST
- **Body**: `{ timestamp, folder }`
- **Response**: Upload signature and credentials

### Delete Image: `/api/upload/delete`
- **Method**: DELETE
- **Body**: `{ publicId }`
- **Response**: Success confirmation

## Components Usage

### Basic Image Upload

```tsx
import { ImageUpload } from '@/components/ui/image-upload';

function ProductForm() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <ImageUpload
      value={images}
      onChange={setImages}
      maxImages={5}
    />
  );
}
```

### Product Image Manager (Advanced)

```tsx
import { ProductImageManager } from '@/components/admin/product-image-manager';

function AdminProductForm() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <ProductImageManager
      productName="Sample Product"
      images={images}
      onImagesChange={setImages}
      maxImages={5}
    />
  );
}
```

### Optimized Image Display

```tsx
import { ProductImage, ProductImageGallery } from '@/components/ui/optimized-image';

// Single optimized image
<ProductImage
  src={product.images[0]}
  alt={product.name}
  size="medium"
/>

// Image gallery with thumbnails
<ProductImageGallery
  images={product.images}
  productName={product.name}
/>
```

## Image Optimization Features

### Automatic Transformations

Images are automatically optimized with:
- **Format**: Auto-detection (WebP, AVIF when supported)
- **Quality**: Auto-optimization based on content
- **Compression**: Lossless optimization
- **Responsive**: Multiple sizes generated

### Predefined Sizes

```typescript
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
  hero: { width: 1920, height: 1080 },
};
```

### Custom Transformations

```tsx
import { getOptimizedImage } from '@/lib/image-utils';

const optimizedUrl = getOptimizedImage(originalUrl, {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto:good',
  format: 'webp'
});
```

## Security Features

### Server-Side Validation
- File type validation (JPEG, PNG, WebP only)
- File size limits (10MB max)
- Secure signature generation

### Client-Side Validation
- Real-time file validation
- Progress feedback
- Error handling

## File Structure

```
├── app/api/upload/
│   ├── images/route.ts          # Main upload endpoint
│   ├── signature/route.ts       # Signature generation
│   └── delete/route.ts          # Image deletion
├── components/
│   ├── ui/
│   │   ├── image-upload.tsx     # Basic upload component
│   │   └── optimized-image.tsx  # Optimized display components
│   └── admin/
│       └── product-image-manager.tsx  # Advanced management
├── hooks/
│   └── use-image-upload.ts      # Upload hook
├── lib/
│   ├── cloudinary.ts           # Cloudinary configuration
│   └── image-utils.ts          # Image utilities
└── docs/
    └── cloudinary-integration.md  # This documentation
```

## Usage Examples

### In Product Creation Form

```tsx
'use client';

import { useState } from 'react';
import { ProductImageManager } from '@/components/admin/product-image-manager';

export function CreateProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    images: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Submit product with images
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other form fields */}
      
      <ProductImageManager
        productName={formData.name}
        images={formData.images}
        onImagesChange={(images) => 
          setFormData(prev => ({ ...prev, images }))
        }
      />
      
      <button type="submit">Create Product</button>
    </form>
  );
}
```

### In Product Display

```tsx
import { ProductImageGallery } from '@/components/ui/optimized-image';

export function ProductDetail({ product }: { product: Product }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ProductImageGallery
        images={product.images}
        productName={product.name}
      />
      
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        {/* Other product details */}
      </div>
    </div>
  );
}
```

## Performance Considerations

1. **Lazy Loading**: Images are lazy-loaded by default
2. **Progressive Enhancement**: Fallback images for failed loads
3. **Caching**: Cloudinary CDN provides global caching
4. **Bandwidth Optimization**: Auto-format selection saves bandwidth
5. **SEO Friendly**: Proper alt tags and structured data support

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check environment variables and Cloudinary credentials
2. **Images Not Loading**: Verify CORS settings in Cloudinary dashboard
3. **Slow Loading**: Ensure proper image optimization settings
4. **File Size Errors**: Check file size limits (10MB default)

### Debug Mode

Enable debug logging by setting:
```env
FASTMCP_LOG_LEVEL="DEBUG"
```

## Best Practices

1. **Image Naming**: Use descriptive alt text for accessibility
2. **File Organization**: Images are organized in `/products` folder
3. **Cleanup**: Delete unused images to save storage
4. **Monitoring**: Monitor usage in Cloudinary dashboard
5. **Backup**: Consider backup strategy for critical images

## Cost Optimization

- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **Optimization**: Auto-format and quality reduce costs
- **Cleanup**: Regular cleanup of unused images
- **Monitoring**: Track usage in dashboard

For more information, visit the [Cloudinary Documentation](https://cloudinary.com/documentation).