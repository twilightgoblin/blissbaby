import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const body = await request.json()
    const {
      name,
      description,
      price,
      comparePrice,
      categoryId,
      brand,
      images,
      inventory,
      lowStock,
      sku,
      barcode,
      weight,
      dimensions,
      tags,
      featured,
      status,
      seoTitle,
      seoDescription
    } = body

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if SKU already exists (excluding current product)
    if (sku && sku !== existingProduct.sku) {
      const existingSku = await db.product.findUnique({
        where: { sku }
      })
      if (existingSku) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        )
      }
    }

    const product = await db.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        categoryId,
        brand,
        images: images || [],
        inventory: parseInt(inventory) || 0,
        lowStock: parseInt(lowStock) || 5,
        sku,
        barcode,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        tags: tags || [],
        featured: featured || false,
        status: status || 'ACTIVE',
        seoTitle,
        seoDescription
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if product is used in any orders
    const orderItems = await db.orderItem.findFirst({
      where: { productId: id }
    })

    if (orderItems) {
      // If product is used in orders, mark as archived instead of deleting
      await db.product.update({
        where: { id },
        data: { status: 'ARCHIVED' }
      })
      
      return NextResponse.json({ 
        message: 'Product archived successfully (cannot delete products with order history)' 
      })
    }

    // Delete the product if no order history
    await db.product.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}