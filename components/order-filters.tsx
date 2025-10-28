"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function OrderFilters() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search orders by ID or customer..." className="pl-9" />
      </div>
      <Select defaultValue="all">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Orders</SelectItem>
          <SelectItem value="payment-approved">Payment Approved</SelectItem>
          <SelectItem value="ready-for-handling">Ready for Handling</SelectItem>
          <SelectItem value="handling">Handling</SelectItem>
          <SelectItem value="invoiced">Invoiced</SelectItem>
          <SelectItem value="canceled">Canceled</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline">Apply Filters</Button>
    </div>
  )
}
