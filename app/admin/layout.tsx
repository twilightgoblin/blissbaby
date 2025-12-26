import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="container mx-auto px-4 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
