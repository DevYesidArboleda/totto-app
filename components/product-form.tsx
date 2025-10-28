"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  createProductAction,
  createSKUAction,
  updatePriceAction,
  updateInventoryAction,
} from "@/app/actions/vtex-actions"
import { Loader2 } from "lucide-react"

export function ProductForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)

      // Create product
      const productResult = await createProductAction(formData)

      if (!productResult.success) {
        throw new Error(productResult.error || "Failed to create product")
      }

      const productId = (productResult?.data as any).Id

      // Create SKU
      formData.set("productId", productId.toString())
      const skuResult = await createSKUAction(formData)

      if (!skuResult.success) {
        throw new Error(skuResult.error || "Failed to create SKU")
      }

      const skuId = (skuResult?.data as any).Id

      // Update price
      const price = Number.parseFloat(formData.get("price") as string)
      await updatePriceAction(skuId, price)

      // Update inventory
      const quantity = Number.parseInt(formData.get("quantity") as string)
      await updateInventoryAction(skuId, "1_1", quantity)

      router.push("/dashboard/products")
    } catch (err) {
      console.error("Error creating product:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" placeholder="Enter product name" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="refId">Reference ID</Label>
          <Input id="refId" name="refId" placeholder="e.g., PROD-001" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Enter product description" rows={4} required />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="departmentId">Department ID</Label>
            <Input id="departmentId" name="departmentId" type="number" placeholder="e.g., 1" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category ID</Label>
            <Input id="categoryId" name="categoryId" type="number" placeholder="e.g., 1" required />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Initial Stock</Label>
            <Input id="quantity" name="quantity" type="number" placeholder="0" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brandId">Brand ID (Optional)</Label>
          <Input id="brandId" name="brandId" type="number" placeholder="e.g., 1" />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          Create Product
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
