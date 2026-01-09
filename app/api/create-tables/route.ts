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
    
    // Create essential tables with raw SQL
    const createTablesSQL = `
      -- Create categories table
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT,
        image TEXT,
        color TEXT DEFAULT 'bg-blue-100',
        "isActive" BOOLEAN DEFAULT true,
        "sortOrder" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
      
      -- Create products table
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("categoryId") REFERENCES categories(id)
      );
      
      -- Create carts table
      CREATE TABLE IF NOT EXISTS carts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "clerkUserId" TEXT NOT NULL,
        "userEmail" TEXT,
        "userName" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
      
      -- Create cart_items table
      CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "cartId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        "productName" TEXT,
        "userName" TEXT,
        "userEmail" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("cartId") REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE("cartId", "productId")
      );
      
      -- Insert some sample categories
      INSERT INTO categories (name, description, icon, color) VALUES 
        ('Baby Care', 'Essential baby care products', '👶', 'bg-pink-100'),
        ('Feeding', 'Bottles, formula, and feeding accessories', '🍼', 'bg-blue-100'),
        ('Toys', 'Educational and fun toys for babies', '🧸', 'bg-yellow-100'),
        ('Clothing', 'Comfortable baby clothes', '👕', 'bg-green-100')
      ON CONFLICT (name) DO NOTHING;
      
      -- Insert some sample products
      INSERT INTO products (name, description, price, "categoryId", inventory, images) 
      SELECT 
        'Baby Bottle',
        'BPA-free baby bottle with anti-colic system',
        299.99,
        c.id,
        50,
        ARRAY['https://example.com/bottle.jpg']
      FROM categories c WHERE c.name = 'Feeding'
      ON CONFLICT (sku) DO NOTHING;
    `
    
    await client.query(createTablesSQL)
    
    // Check what tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    client.release()
    await pool.end()
    
    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
      tables: tablesResult.rows.map(row => row.table_name)
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