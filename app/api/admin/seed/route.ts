import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { ProductStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Additional security: check if user is admin (you can customize this)
    const adminEmails = ['your-admin-email@example.com'] // Replace with your email
    const user = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }).then(res => res.json())

    if (!adminEmails.includes(user.email_addresses?.[0]?.email_address)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('🌱 Starting database seed...')

    // Create categories
    const categories = await Promise.all([
      db.categories.upsert({
        where: { name: 'Baby Feeding' },
        update: {},
        create: {
          name: 'Baby Feeding',
          description: 'Bottles, sippy cups, high chairs, bibs, and feeding accessories',
          icon: null,
          color: 'bg-blue-100',
          sortOrder: 1
        }
      }),
      db.categories.upsert({
        where: { name: 'Diapers & Wipes' },
        update: {},
        create: {
          name: 'Diapers & Wipes',
          description: 'Disposable diapers, cloth diapers, wipes, and changing essentials',
          icon: null,
          color: 'bg-green-100',
          sortOrder: 2
        }
      }),
      db.categories.upsert({
        where: { name: 'Baby Clothing' },
        update: {},
        create: {
          name: 'Baby Clothing',
          description: 'Onesies, sleepers, outfits, socks, and clothing accessories',
          icon: null,
          color: 'bg-pink-100',
          sortOrder: 3
        }
      }),
      db.categories.upsert({
        where: { name: 'Toys & Development' },
        update: {},
        create: {
          name: 'Toys & Development',
          description: 'Educational toys, teethers, rattles, and developmental play items',
          icon: null,
          color: 'bg-yellow-100',
          sortOrder: 4
        }
      }),
      db.categories.upsert({
        where: { name: 'Baby Care & Health' },
        update: {},
        create: {
          name: 'Baby Care & Health',
          description: 'Lotions, shampoos, thermometers, and health monitoring',
          icon: null,
          color: 'bg-teal-100',
          sortOrder: 5
        }
      }),
      db.categories.upsert({
        where: { name: 'Strollers & Car Seats' },
        update: {},
        create: {
          name: 'Strollers & Car Seats',
          description: 'Strollers, car seats, carriers, and travel systems',
          icon: null,
          color: 'bg-orange-100',
          sortOrder: 6
        }
      })
    ])

    console.log('✅ Categories created:', categories.length)

    // Create sample products
    const sampleProducts = [
      {
        name: 'Premium Baby Bottle Set',
        description: 'BPA-free baby bottles with anti-colic system. Perfect for newborns and growing babies.',
        price: 1299.00,
        comparePrice: 1599.00,
        categoryId: categories[0].id,
        brand: 'BabyBliss',
        inventory: 50,
        lowStock: 10,
        sku: 'BB-BOTTLE-001',
        featured: true,
        status: ProductStatus.ACTIVE,
        tags: ['bottles', 'feeding', 'anti-colic'],
        images: []
      },
      {
        name: 'Organic Cotton Diapers (Pack of 30)',
        description: 'Ultra-soft organic cotton diapers with superior absorption. Gentle on baby\'s skin.',
        price: 899.00,
        comparePrice: 1099.00,
        categoryId: categories[1].id,
        brand: 'EcoSoft',
        inventory: 100,
        lowStock: 20,
        sku: 'ES-DIAPER-001',
        featured: true,
        status: ProductStatus.ACTIVE,
        tags: ['diapers', 'organic', 'cotton'],
        images: []
      },
      {
        name: 'Cute Baby Onesie Set (3-Pack)',
        description: 'Adorable cotton onesies in various colors. Soft, comfortable, and easy to wash.',
        price: 699.00,
        categoryId: categories[2].id,
        brand: 'TinyTots',
        inventory: 75,
        lowStock: 15,
        sku: 'TT-ONESIE-001',
        featured: false,
        status: ProductStatus.ACTIVE,
        tags: ['clothing', 'onesie', 'cotton'],
        images: []
      },
      {
        name: 'Educational Stacking Rings',
        description: 'Colorful stacking rings that help develop hand-eye coordination and color recognition.',
        price: 449.00,
        categoryId: categories[3].id,
        brand: 'PlaySmart',
        inventory: 30,
        lowStock: 5,
        sku: 'PS-STACK-001',
        featured: false,
        status: ProductStatus.ACTIVE,
        tags: ['toys', 'educational', 'development'],
        images: []
      },
      {
        name: 'Gentle Baby Shampoo',
        description: 'Tear-free baby shampoo with natural ingredients. Perfect for daily use.',
        price: 299.00,
        categoryId: categories[4].id,
        brand: 'PureCare',
        inventory: 5,
        lowStock: 10,
        sku: 'PC-SHAMPOO-001',
        featured: false,
        status: ProductStatus.ACTIVE,
        tags: ['shampoo', 'gentle', 'natural'],
        images: []
      },
      {
        name: 'Lightweight Travel Stroller',
        description: 'Compact and lightweight stroller perfect for travel. Easy one-hand fold.',
        price: 8999.00,
        comparePrice: 10999.00,
        categoryId: categories[5].id,
        brand: 'TravelEase',
        inventory: 15,
        lowStock: 3,
        sku: 'TE-STROLLER-001',
        featured: true,
        status: ProductStatus.ACTIVE,
        tags: ['stroller', 'travel', 'lightweight'],
        images: []
      }
    ]

    const products = await Promise.all(
      sampleProducts.map(product =>
        db.product.upsert({
          where: { sku: product.sku },
          update: {},
          create: product
        })
      )
    )

    console.log('✅ Sample products created:', products.length)

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        categoriesCreated: categories.length,
        productsCreated: products.length
      }
    })

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}