import { NextRequest, NextResponse } from 'next/server';
import { generateSignature } from '@/lib/cloudinary-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timestamp, folder = 'products' } = body;

    // Validate required fields
    if (!timestamp) {
      return NextResponse.json(
        { error: 'Timestamp is required' },
        { status: 400 }
      );
    }

    // Parameters for signature generation
    const params = {
      timestamp,
      folder,
      upload_preset: undefined, // We'll use API key/secret instead
    };

    // Generate signature
    const signature = generateSignature(params);

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error) {
    console.error('Error generating upload signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}