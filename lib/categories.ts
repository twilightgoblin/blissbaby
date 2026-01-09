import { db } from './db'

export interface CreateCategoryData {
  name: string
  description?: string
  icon?: string
  image?: string
  color?: string
}

export interface UpdateCategoryData extends CreateCategoryData {
  isActive?: boolean
}

export async function getCategories() {
  return await db.categories.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { sortOrder: 'asc' }
  })
}

export async function getCategoryById(id: string) {
  return await db.categories.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true }
      }
    }
  })
}

export async function createCategory(data: CreateCategoryData) {
  return await db.categories.create({
    data: {
      ...data,
      color: data.color || 'bg-blue-100'
    }
  })
}

export async function updateCategory(id: string, data: UpdateCategoryData) {
  // Filter out undefined values and add updatedAt
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )
  
  // Ensure updatedAt is always set
  updateData.updatedAt = new Date()
  
  return await db.categories.update({
    where: { id },
    data: updateData
  })
}

export async function deleteCategory(id: string) {
  // Validate that id is provided
  if (!id || typeof id !== 'string') {
    throw new Error('Valid category ID is required')
  }

  // Check if category has products
  const categoryWithProducts = await db.categories.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  if (!categoryWithProducts) {
    throw new Error('Category not found')
  }

  if (categoryWithProducts._count.products > 0) {
    throw new Error('Cannot delete category with products. Please move or delete products first.')
  }

  return await db.categories.delete({
    where: { id }
  })
}

// Utility function to get categories for dropdown/select components
export async function getCategoriesForSelect() {
  const categories = await db.categories.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true
    },
    orderBy: { sortOrder: 'asc' }
  })

  return categories.map(category => ({
    value: category.id,
    label: category.name,
    icon: category.icon,
    color: category.color
  }))
}

// Get category statistics
export async function getCategoryStats() {
  const categories = await db.categories.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  return {
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.isActive).length,
    categoriesWithProducts: categories.filter(c => c._count.products > 0).length,
    totalProducts: categories.reduce((sum, c) => sum + c._count.products, 0)
  }
}