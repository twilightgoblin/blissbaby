import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST() {
  try {
    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false }
    })
    
    const client = await pool.connect()
    
    // Get category IDs
    const categoriesResult = await client.query('SELECT id, name FROM categories LIMIT 10')
    const categories = categoriesResult.rows
    
    if (categories.length === 0) {
      client.release()
      await pool.end()
      return NextResponse.json({
        success: false,
        error: 'No categories found. Please create categories first.'
      }, { status: 400 })
    }
    
    // Sample products data
    const sampleProducts = [
      {
        name: 'Premium Baby Bottle',
        description: 'BPA-free baby bottle with anti-colic system and natural flow nipple',
        price: 299.99,
        categoryName: 'Feeding',
        brand: 'BabyBliss',
        images: ['https://via.placeholder.com/300x300?text=Baby+Bottle'],
        inventory: 50,
        featured: true
      },
      {
        name: 'Soft Baby Blanket',
        description: 'Ultra-soft organic cotton blanket perfect for newborns',
        price: 599.99,
        categoryName: 'Baby Care',
        brand: 'BabyBliss',
        images: ['https://via.placeholder.com/300x300?text=Baby+Blanket'],
        inventory: 30,
        featured: true
      },
      {
        name: 'Educational Baby Toy',
        description: 'Colorful educational toy to stimulate baby\'s development',
        price: 199.99,
        categoryName: 'Toys',
        brand: 'BabyBliss',
        images: ['https://via.placeholder.com/300x300?text=Baby+Toy'],
        inventory: 25,
        featured: false
      },
      {
        name: 'Baby Onesie Set',
        description: 'Set of 3 comfortable cotton onesies in different colors',
        price: 449.99,
        categoryName: 'Clothing',
        brand: 'BabyBliss',
        images: ['https://via.placeholder.com/300x300?text=Baby+Onesie'],
        inventory: 40,
        featured: true
      },
      {
        name: 'Baby Feeding Chair',
        description: 'Adjustable high chair perfect for feeding time',
        price: 2999.99,
        categoryName: 'Baby Feeding',
        brand: 'BabyBliss',
        images: ['https://via.placeholder.com/300x300?text=High+Chair'],
        inventory: 15,
        featured: false
      },
      {
        name: 'Diaper Pack',
        description: 'Premium quality diapers for all-day comfort',
        price: 899.99,
        categoryName: 'Diapers & Wipes',
        brand: 'BabyBliss',
        images: ['https://via.placeholder.com/300x300?text=Diapers'],
        inventory: 100,
        featured: false
      }
    ]
    
    let createdCount = 0
    
    for (const product of sampleProducts) {
      // Find category ID
      const category = categories.find(c => c.name === product.categoryName)
      if (!category) continue
      
      // Check if product already exists
      const existingProduct = await client.query('SELECT id FROM products WHERE name = $1', [product.name])
      if (existingProduct.rows.length > 0) continue
      
      // Create product
      const productId = crypto.randomUUID()
      
      await client.query(`
        INSERT INTO products (
          id, name, description, price, "categoryId", brand, images, 
          inventory, featured, status, "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
        )
      `, [
        productId,
        product.name,
        product.description,
        product.price,
        category.id,
        product.brand,
        product.images,
        product.inventory,
        product.featured,
        'ACTIVE'
      ])
      
      createdCount++
    }
    
    client.release()
    await pool.end()
    
    return NextResponse.json({
      success: true,
      message: `Created ${createdCount} sample products`,
      createdCount
    })
    
  } catch (error) {
    console.error('Error seeding products:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to seed products'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to seed sample products'
  })
}