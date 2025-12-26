"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2 } from "lucide-react"

export default function CategoriesPage() {
  const categories = [
    {
      id: 1,
      name: "Baby Care",
      description: "Essential care products for babies",
      products: 24,
      color: "bg-blue-100 text-blue-700",
      icon: "🍼",
    },
    {
      id: 2,
      name: "Feeding",
      description: "Bottles, utensils, and feeding accessories",
      products: 18,
      color: "bg-green-100 text-green-700",
      icon: "🍽️",
    },
    {
      id: 3,
      name: "Toys",
      description: "Safe and fun toys for babies",
      products: 32,
      color: "bg-yellow-100 text-yellow-700",
      icon: "🧸",
    },
    {
      id: 4,
      name: "Clothing",
      description: "Comfortable and stylish baby clothes",
      products: 45,
      color: "bg-purple-100 text-purple-700",
      icon: "👕",
    },
    {
      id: 5,
      name: "Hygiene",
      description: "Bath and hygiene products",
      products: 16,
      color: "bg-pink-100 text-pink-700",
      icon: "🧼",
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories Management</h1>
          <p className="text-muted-foreground mt-2">Organize your product categories</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new product category</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input id="category-name" placeholder="Enter category name" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  placeholder="Category description"
                  className="rounded-xl"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-icon">Icon Emoji</Label>
                <Input id="category-icon" placeholder="🍼" className="rounded-xl" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-full bg-transparent">
                Cancel
              </Button>
              <Button className="rounded-full bg-primary hover:bg-primary/90">Create Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="rounded-3xl border-border/60 hover-lift">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${category.color} text-2xl`}>
                    {category.icon}
                  </div>
                  <Badge className="rounded-full bg-muted text-muted-foreground hover:bg-muted">
                    {category.products} products
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <div className="flex gap-2 border-t border-border/40 pt-4">
                  <Button variant="outline" size="sm" className="flex-1 rounded-full bg-transparent">
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 bg-transparent"
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
    </div>
  )
}
