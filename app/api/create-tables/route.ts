import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST() {
  try {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not found'
      }, { status: 500 })
    }
    
    const pool = new Pool({
      connectionString,
      max: 1,
      ssl: {
        rejectUnauthorized: false
      }
    })
    
    const client = await pool.connect()
    
    // Enable UUID extension first
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    
    // Create essential tables with raw SQL
    const createTablesSQL = `
      -- Create categories table
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT,
        image TEXT,
        color TEXT DEFAULT 'bg-blue-100',
        "isActive" BOOLEAN DEFAULT true,
        "sortOrder" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create products table
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        "comparePrice" DECIMAL(10,2),
        sku TEXT UNIQUE,
        barcode TEXT,
        "categoryId" TEXT,
        brand TEXT,
        images TEXT[] DEFAULT '{}',
        weight DECIMAL(8,2),
        dimensions JSONB,
        inventory INTEGER DEFAULT 0,
        "lowStock" INTEGER DEFAULT 5,
        status TEXT DEFAULT 'ACTIVE',
        featured BOOLEAN DEFAULT false,
        tags TEXT[] DEFAULT '{}',
        "seoTitle" TEXT,
        "seoDescription" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY ("categoryId") REFERENCES categories(id)
      );
      
      -- Create carts table
      CREATE TABLE IF NOT EXISTS carts (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        "clerkUserId" TEXT NOT NULL,
        "userEmail" TEXT,
        "userName" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create cart_items table
      CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
        "cartId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        "productName" TEXT,
        "userName" TEXT,
        "userEmail" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY ("cartId") REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE("cartId", "productId")
      );
    `
    
    await client.query(createTablesSQL)
    
    // Insert sample data with explicit timestamps
    const insertDataSQL = `
      -- Insert sample categories with explicit timestamps
      INSERT INTO categories (id, name, description, icon, color, "createdAt", "updatedAt") VALUES 
        (uuid_generate_v4()::text, 'Baby Care', 'Essential baby care products', '👶', 'bg-pink-100', NOW(), NOW()),
        (uuid_generate_v4()::text, 'Feeding', 'Bottles, formula, and feeding accessories', '🍼', 'bg-blue-100', NOW(), NOW()),
        (uuid_generate_v4()::text, 'Toys', 'Educational and fun toys for babies', '🧸', 'bg-yellow-100', NOW(), NOW()),
        (uuid_generate_v4()::text, 'Clothing', 'Comfortable baby clothes', '👕', 'bg-green-100', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
      
      -- Insert sample product
      INSERT INTO products (id, name, description, price, "categoryId", inventory, images, "createdAt", "updatedAt") 
      SELECT 
        uuid_generate_v4()::text,
        'Baby Bottle',
        'BPA-free baby bottle with anti-colic system',
        299.99,
        c.id,
        50,
        ARRAY['https://example.com/bottle.jpg'],
        NOW(),
        NOW()
      FROM categories c WHERE c.name = 'Feeding' LIMIT 1
      ON CONFLICT (sku) DO NOTHING;
    `
    
    await client.query(insertDataSQL)
    
    // Check what tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    // Count records
    const categoryCount = await client.query('SELECT COUNT(*) FROM categories')
    const productCount = await client.query('SELECT COUNT(*) FROM products')
    
    client.release()
    await pool.end()
    
    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
      tables: tablesResult.rows.map(row => row.table_name),
      counts: {
        categories: parseInt(categoryCount.rows[0].count),
        products: parseInt(productCount.rows[0].count)
      }
    })
    
  } catch (error) {
    console.error('Table creation error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Table creation failed',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to create database tables'
  })
}