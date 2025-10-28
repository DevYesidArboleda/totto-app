import { OrdersTable } from "@/components/dashboard/orders-table"
import { OrderFilters } from "@/components/dashboard/order-filters"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Orders</h2>
        <p className="text-muted-foreground">View and manage your VTEX orders</p>
      </div>

      <OrderFilters />
      <OrdersTable />
    </div>
  )
}
