#!/usr/bin/env tsx
import 'dotenv/config'
import { execSync } from 'child_process'

async function deployDatabase() {
  console.log('🚀 Deploying database changes...')
  
  try {
    // Run migrations
    console.log('📦 Running Prisma migrations...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    // Run seed
    console.log('🌱 Seeding database...')
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' })
    
    console.log('✅ Database deployment completed successfully!')
  } catch (error) {
    console.error('❌ Database deployment failed:', error)
    process.exit(1)
  }
}

deployDatabase()