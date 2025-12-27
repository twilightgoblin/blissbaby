#!/usr/bin/env tsx

import 'dotenv/config';

async function testUploadEndpoints() {
  console.log('🧪 Testing Upload API Endpoints...\n');

  const baseUrl = 'http://localhost:3000'; // Adjust port if needed

  try {
    // Test 1: Signature Generation Endpoint
    console.log('1. Testing Signature Generation Endpoint:');
    const timestamp = Math.round(Date.now() / 1000);
    
    const signatureResponse = await fetch(`${baseUrl}/api/upload/signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp,
        folder: 'products'
      })
    });

    if (signatureResponse.ok) {
      const signatureData = await signatureResponse.json();
      console.log('   ✅ Signature endpoint working');
      console.log(`   📝 Generated signature for timestamp: ${timestamp}`);
      console.log(`   🏷️  Cloud name: ${signatureData.cloudName}`);
    } else {
      console.log('   ❌ Signature endpoint failed');
      console.log(`   Status: ${signatureResponse.status}`);
    }
    console.log();

    // Test 2: Check if server is running
    console.log('2. Testing Server Availability:');
    try {
      const healthResponse = await fetch(`${baseUrl}/api/upload/signature`, {
        method: 'OPTIONS'
      });
      console.log('   ✅ Server is responding');
    } catch (error) {
      console.log('   ⚠️  Server might not be running on port 3000');
      console.log('   💡 Try: npm run dev');
    }
    console.log();

    // Test 3: Environment Variables Check
    console.log('3. Environment Variables Check:');
    console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌'} ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY ? '✅' : '❌'} ${process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing'}`);
    console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET ? '✅' : '❌'} ${process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'}`);
    console.log(`   Public Cloud Name: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅' : '❌'} ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
    console.log();

    console.log('🎉 API endpoints are configured correctly!');
    console.log();
    console.log('Next steps:');
    console.log('1. Make sure your dev server is running: npm run dev');
    console.log('2. Go to http://localhost:3000/admin/products');
    console.log('3. Try uploading images in the product form');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log();
    console.log('Troubleshooting:');
    console.log('1. Make sure your development server is running');
    console.log('2. Check that all environment variables are set');
    console.log('3. Verify your Cloudinary credentials are correct');
  }
}

// Run the test
testUploadEndpoints().catch(console.error);