"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { SingleImageUpload } from "@/components/ui/single-image-upload"
import Image from "next/image"

interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  image?: string
  color?: string
  isActive: boolean
  _count: {
    products: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    image: '',
    color: 'bg-blue-100'
  })

  const colorOptions = [
    'bg-blue-100',
    'bg-green-100',
    'bg-pink-100',
    'bg-yellow-100',
    'bg-teal-100',
    'bg-orange-100',
    'bg-purple-100',
    'bg-indigo-100',
    'bg-cyan-100',
    'bg-rose-100',
    'bg-emerald-100',
    'bg-red-100',
    'bg-amber-100',
    'bg-slate-100',
    'bg-lime-100'
  ]

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      toast.error("Failed to fetch categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      image: '',
      color: 'bg-blue-100'
    })
  }

  // Handle add category
  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create category')
      }

      toast.success("Category created successfully")

      setIsAddDialogOpen(false)
      resetForm()
      fetchCategories()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create category')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit category
  const handleEditCategory = async () => {
    if (!selectedCategory || !formData.name.trim()) return

    setSubmitting(true)
    try {
      console.log('Updating category:', selectedCategory.id, formData)
      
      const response = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          icon: formData.icon.trim() || null,
          image: formData.image.trim() || null
        })
      })

      const responseData = await response.json()
      console.log('Update response:', response.status, responseData)

      if (!response.ok) {
        throw new Error(responseData.error || `Server error: ${response.status}`)
      }

      toast.success("Category updated successfully")

      setIsEditDialogOpen(false)
      setSelectedCategory(null)
      resetForm()
      fetchCategories()
    } catch (error: any) {
      console.error('Update error:', error)
      
      // More specific error messages
      if (error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.')
      } else if (error.message.includes('500')) {
        toast.error('Server error. Please try again or contact support.')
      } else {
        toast.error(error?.message || 'Failed to update category')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }

      toast.success("Category deleted successfully")

      setIsDeleteDialogOpen(false)
      setSelectedCategory(null)
      fetchCategories()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete category')
    } finally {
      setSubmitting(false)
    }
  }

  // Open edit dialog
  const openEditDialog = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      image: category.image || '',
      color: category.color || 'bg-blue-100'
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories Management</h1>
          <p className="text-muted-foreground mt-2">Organize your product categories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new product category</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name *</Label>
                <Input 
                  id="category-name" 
                  placeholder="Enter category name" 
                  className="rounded-xl"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  placeholder="Category description"
                  className="rounded-xl"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Category Image</Label>
                <SingleImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData(prev => ({ ...prev, image: url || '' }))}
                  placeholder="Upload category image"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-icon">Icon (Optional)</Label>
                <Input 
                  id="category-icon" 
                  placeholder="Enter icon or leave empty" 
                  className="rounded-xl"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${color} border-2 ${
                        formData.color === color ? 'border-primary' : 'border-transparent'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
              <Button 
                variant="outline" 
                className="rounded-full bg-transparent"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button 
                className="rounded-full bg-primary hover:bg-primary/90"
                onClick={handleAddCategory}
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card className="rounded-3xl border-border/60">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-6xl text-gray-400">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">No categories yet</h3>
              <p className="text-muted-foreground">Create your first category to organize your products</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="rounded-3xl border-border/60 hover-lift">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center ${category.color} text-2xl font-semibold text-gray-600`}>
                          {category.icon || category.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <Badge className="rounded-full bg-muted text-muted-foreground hover:bg-muted">
                      {category._count.products} products
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex gap-2 border-t border-border/40 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 rounded-full bg-transparent"
                      onClick={() => openEditDialog(category)}
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 bg-transparent"
                      onClick={() => openDeleteDialog(category)}
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Category Name *</Label>
              <Input 
                id="edit-category-name" 
                placeholder="Enter category name" 
                className="rounded-xl"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-description">Description</Label>
              <Textarea
                id="edit-category-description"
                placeholder="Category description"
                className="rounded-xl"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Category Image</Label>
              <SingleImageUpload
                value={formData.image}
                onChange={(url) => setFormData(prev => ({ ...prev, image: url || '' }))}
                placeholder="Upload category image"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-icon">Icon (Optional)</Label>
              <Input 
                id="edit-category-icon" 
                placeholder="Enter icon or leave empty" 
                className="rounded-xl"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full ${color} border-2 ${
                      formData.color === color ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button 
              variant="outline" 
              className="rounded-full bg-transparent"
              onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedCategory(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button 
              className="rounded-full bg-primary hover:bg-primary/90"
              onClick={handleEditCategory}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? 
              {selectedCategory?._count?.products && selectedCategory._count.products > 0 && (
                <span className="text-destructive font-medium">
                  {" "}This category has {selectedCategory._count.products} products and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="rounded-full bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteCategory}
              disabled={submitting || Boolean(selectedCategory?._count?.products && selectedCategory._count.products > 0)}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
