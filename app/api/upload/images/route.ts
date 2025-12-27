import { NextRequest, NextResponse } from 'next/server';
import cloudinary, { productImageUploadOptions } from '@/lib/cloudinary-server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}` },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size is 10MB` },
          { status: 400 }
        );
      }
    }

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            ...productImageUploadOptions,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                publicId: result?.public_id,
                url: result?.secure_url,
                width: result?.width,
                height: result?.height,
                format: result?.format,
                bytes: result?.bytes,
                eager: result?.eager,
              });
            }
          }
        ).end(buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      images: uploadResults,
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}