#!/usr/bin/env tsx

import 'dotenv/config';
import cloudinary from '../lib/cloudinary-server';

async function testCloudinaryConnection() {
  console.log('🧪 Testing Cloudinary Connection...\n');

  try {
    // Test 1: Check configuration
    console.log('1. Configuration Check:');
    console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log();

    // Test 2: API Connection
    console.log('2. API Connection Test:');
    const result = await cloudinary.api.ping();
    console.log(`   Status: ${result.status}`);
    console.log('   ✅ Connection successful!');
    console.log();

    // Test 3: Upload Folder Check
    console.log('3. Upload Folder Check:');
    try {
      const folders = await cloudinary.api.root_folders();
      const productFolder = folders.folders.find((f: any) => f.name === 'products');
      
      if (productFolder) {
        console.log('   ✅ Products folder exists');
      } else {
        console.log('   ℹ️  Products folder will be created on first upload');
      }
    } catch (error) {
      console.log('   ℹ️  Unable to check folders (this is normal for new accounts)');
    }
    console.log();

    // Test 4: Transformation Test
    console.log('4. URL Transformation Test:');
    const testUrl = cloudinary.url('sample', {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto'
    });
    console.log(`   Generated URL: ${testUrl}`);
    console.log('   ✅ URL generation working');
    console.log();

    console.log('🎉 All tests passed! Cloudinary is ready to use.');
    console.log();
    console.log('Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Go to /admin/products to test image uploads');
    console.log('3. Upload some test images to verify everything works');

  } catch (error) {
    console.error('❌ Cloudinary test failed:');
    console.error(error);
    console.log();
    console.log('Troubleshooting:');
    console.log('1. Check your .env file has correct Cloudinary credentials');
    console.log('2. Verify your Cloudinary account is active');
    console.log('3. Check your internet connection');
    process.exit(1);
  }
}

// Run the test
testCloudinaryConnection().catch(console.error);