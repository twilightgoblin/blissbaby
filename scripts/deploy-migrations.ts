#!/usr/bin/env tsx

import { execSync } from 'child_process'

async function deployMigrations() {
  try {
    console.log('🔄 Deploying database migrations...')
    
    // Test database connection first
    execSync('npx prisma db pull --force', { stdio: 'inherit' })
    console.log('✅ Database connection successful')
    
    // Deploy migrations
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    console.log('✅ Migrations deployed successfully')
    
    // Optional: Run seed if needed
    // execSync('npm run db:seed', { stdio: 'inherit' })
    
  } catch (error) {
    console.error('❌ Migration deployment failed:', error)
    
    // Don't fail the build, just log the error
    console.log('⚠️  Continuing build without migrations...')
    console.log('💡 You may need to run migrations manually after deployment')
  }
}

deployMigrations()