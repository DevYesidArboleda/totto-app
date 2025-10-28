"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Loader2 } from "lucide-react"
import { listOrdersAction } from "@/app/actions/vtex-actions"
import Link from "next/link"
import type { VTEXOrder } from "@/lib/types"

export function OrdersTable() {
  const [orders, setOrders] = useState<VTEXOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const result = await listOrdersAction(1, 15)
        if (result.success && result.data?.list) {
          setOrders(result.data?.list)
        } else {
          setError(result.error || "Failed to load orders")
        }
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("An error occurred while loading orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border p-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-12 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No orders yet</h3>
          <p className="text-sm text-muted-foreground">Orders will appear here once customers make purchases</p>
        </div>
      </div>
    )
  }

  function getStatusVariant(status: string) {
    const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "payment-approved": "default",
      "ready-for-handling": "default",
      handling: "secondary",
      invoiced: "default",
      canceled: "destructive",
    }
    return statusMap[status] || "outline"
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell className="font-medium">{order.orderId}</TableCell>
              <TableCell>
                {order.clientProfileData?.firstName} {order.clientProfileData?.lastName}
              </TableCell>
              <TableCell>{new Date(order.creationDate).toLocaleDateString()}</TableCell>
              <TableCell>{order.items?.length || 0}</TableCell>
              <TableCell>${(order.value / 100).toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(order.status)}>{order.statusDescription}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link href={`/dashboard/orders/${order.orderId}`}>
                    <Eye className="size-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
