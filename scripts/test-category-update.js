#!/usr/bin/env node

// Simple test script to verify category update functionality
const https = require('https');

async function testCategoryUpdate(baseUrl, categoryId, updateData) {
  return new Promise((resolve) => {
    const data = JSON.stringify(updateData);
    
    const options = {
      hostname: new URL(baseUrl).hostname,
      port: 443,
      path: `/api/admin/categories/${categoryId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${responseData}`);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (err) => {
      console.error(`Error: ${err.message}`);
      resolve({ status: 0, error: err.message });
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  const [baseUrl, categoryId] = process.argv.slice(2);
  
  if (!baseUrl || !categoryId) {
    console.log('Usage: node test-category-update.js <base-url> <category-id>');
    console.log('Example: node test-category-update.js https://your-app.vercel.app category-123');
    process.exit(1);
  }

  console.log(`Testing category update at: ${baseUrl}`);
  console.log(`Category ID: ${categoryId}\n`);

  const testData = {
    name: 'Test Category Updated',
    description: 'Updated description',
    color: 'bg-green-100'
  };

  await testCategoryUpdate(baseUrl, categoryId, testData);
}

main().catch(console.error);