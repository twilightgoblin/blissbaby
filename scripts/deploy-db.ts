#!/usr/bin/env tsx
import 'dotenv/config'
import { execSync } from 'child_process'

async function deployDatabase() {
  console.log('🚀 Deploying database changes...')
  
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  DATABASE_URL not found, skipping database deployment')
      return
    }

    // Run migrations only (skip seeding in production)
    console.log('📦 Running Prisma migrations...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    console.log('✅ Database deployment completed successfully!')
  } catch (error) {
    console.error('❌ Database deployment failed:', error)
    // Don't exit with error in production build
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Continuing build without database deployment')
    } else {
      process.exit(1)
    }
  }
}

deployDatabase()