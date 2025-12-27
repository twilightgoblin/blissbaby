import { NextRequest, NextResponse } from 'next/server';
import { deleteImage } from '@/lib/cloudinary-server';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    await deleteImage(publicId);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}