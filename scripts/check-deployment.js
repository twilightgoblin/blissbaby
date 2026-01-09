#!/usr/bin/env node

const https = require('https');

async function checkEndpoint(url, description) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✓ ${description}: ${res.statusCode}`);
        if (res.statusCode >= 400) {
          console.log(`  Error: ${data}`);
        }
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (err) => {
      console.log(`✗ ${description}: ${err.message}`);
      resolve({ status: 0, error: err.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`✗ ${description}: Timeout`);
      req.destroy();
      resolve({ status: 0, error: 'Timeout' });
    });
  });
}

async function main() {
  const baseUrl = process.argv[2];
  
  if (!baseUrl) {
    console.log('Usage: node check-deployment.js <base-url>');
    console.log('Example: node check-deployment.js https://your-app.vercel.app');
    process.exit(1);
  }

  console.log(`Checking deployment at: ${baseUrl}\n`);

  const checks = [
    { url: `${baseUrl}/api/health/db`, desc: 'Database Health' },
    { url: `${baseUrl}/api/categories`, desc: 'Categories API' },
    { url: `${baseUrl}/api/admin/categories`, desc: 'Admin Categories API' },
  ];

  for (const check of checks) {
    await checkEndpoint(check.url, check.desc);
  }
  
  console.log('\nDeployment check complete!');
}

main().catch(console.error);