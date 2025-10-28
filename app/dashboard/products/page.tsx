import { ProductsTable } from "@/components/dashboard/products-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-muted-foreground">Manage your VTEX product catalog</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus />
            Add Product
          </Link>
        </Button>
      </div>

      <ProductsTable />
    </div>
  )
}
