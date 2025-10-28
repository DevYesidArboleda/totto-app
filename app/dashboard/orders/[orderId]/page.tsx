import { getOrderAction } from "@/app/actions/vtex-actions"
import { OrderDetails } from "@/components/dashboard/order-details"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const result = await getOrderAction(orderId)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Order Details</h2>
          <p className="text-muted-foreground">Order ID: {orderId}</p>
        </div>
      </div>

      <OrderDetails order={result.data} />
    </div>
  )
}
