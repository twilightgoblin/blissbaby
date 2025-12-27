'use client';

import React, { useState } from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, Upload, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageManagerProps {
  productId?: string;
  productName: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ProductImageManager({
  productId,
  productName,
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}: ProductImageManagerProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleClearAllImages = () => {
    if (window.confirm('Are you sure you want to remove all images?')) {
      onImagesChange([]);
      setSelectedImageIndex(0);
    }
  };

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
    // Reset to first image after reordering
    setSelectedImageIndex(0);
  };

  // Reset selected image index when images change
  React.useEffect(() => {
    if (selectedImageIndex >= images.length) {
      setSelectedImageIndex(Math.max(0, images.length - 1));
    }
  }, [images.length, selectedImageIndex]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Product Images
            {images.length > 0 && (
              <Badge variant="secondary">
                {images.length}/{maxImages}
              </Badge>
            )}
          </CardTitle>
          
          {images.length > 0 && !disabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllImages}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <ImageUpload
              value={images}
              onChange={onImagesChange}
              maxImages={maxImages}
              disabled={disabled}
            />

            {images.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-medium">Image Management Tips:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• The first image will be used as the main product image</li>
                  <li>• Drag and drop to reorder images</li>
                  <li>• Images are automatically optimized for web performance</li>
                  <li>• Multiple sizes are generated for responsive display</li>
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            {images.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Gallery Preview</h4>
                  <div className="max-w-md space-y-4">
                    {/* Main Image */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                      <img
                        src={images[selectedImageIndex]}
                        alt={`${productName} - Image ${selectedImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Image counter */}
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {selectedImageIndex + 1} / {images.length}
                      </div>
                    </div>

                    {/* Thumbnail Navigation */}
                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={cn(
                              'flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors',
                              selectedImageIndex === index
                                ? 'border-primary ring-2 ring-primary/20'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <img
                              src={image}
                              alt={`${productName} - Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Gallery info */}
                    <div className="text-xs text-gray-500 text-center">
                      Click thumbnails to preview • First image is the main product image
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">All Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="space-y-2">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={image}
                            alt={`${productName} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-xs text-center text-gray-500">
                          Image {index + 1}
                          {index === 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              Main
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No images uploaded yet</p>
                <p className="text-sm">Switch to the Upload tab to add images</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Reorderable image list component
interface ReorderableImageListProps {
  images: string[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function ReorderableImageList({
  images,
  onReorder,
  onRemove,
  disabled = false,
}: ReorderableImageListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-2">
      {images.map((image, index) => (
        <div
          key={index}
          draggable={!disabled}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          className={`
            flex items-center gap-3 p-3 border rounded-lg transition-colors
            ${!disabled ? 'cursor-move hover:bg-gray-50' : ''}
            ${draggedIndex === index ? 'opacity-50' : ''}
          `}
        >
          <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-100">
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-medium">Image {index + 1}</p>
            {index === 0 && (
              <Badge variant="secondary" className="text-xs">
                Main Image
              </Badge>
            )}
          </div>
          
          {!disabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}