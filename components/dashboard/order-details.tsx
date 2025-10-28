"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import type { VTEXOrder } from "@/lib/types"

interface OrderDetailsProps {
  order: VTEXOrder
}

export function OrderDetails({ order }: { order: any }) {
  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Order #{order.sequence}</CardTitle>
              <CardDescription>Placed on {new Date(order.creationDate).toLocaleString()}</CardDescription>
            </div>
            <Badge>{order.statusDescription}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Order ID</p>
              <p className="text-sm text-muted-foreground">{order.orderId}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Sales Channel</p>
              <p className="text-sm text-muted-foreground">{order.salesChannel}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Origin</p>
              <p className="text-sm text-muted-foreground">{order.origin}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-sm text-muted-foreground">{new Date(order.lastChange).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">
                {order.clientProfileData?.firstName} {order.clientProfileData?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{order.clientProfileData?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">{order.clientProfileData?.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Document</p>
              <p className="text-sm text-muted-foreground">{order.clientProfileData?.document}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>{order.items?.length || 0} items in this order</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item:any) => (
                <TableRow key={item.uniqueId}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.refId}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${(item.price / 100).toFixed(2)}</TableCell>
                  <TableCell className="text-right">${(item.sellingPrice / 100).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Order Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {order.totals?.map((total:any) => (
            <div key={total.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{total.name}</span>
              <span className="font-medium">${(total.value / 100).toFixed(2)}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>${(order.value / 100).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
