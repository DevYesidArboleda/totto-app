"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Package, User, MapPin, CreditCard, Calendar, CheckCircle2, XCircle } from "lucide-react"
import { getOrderAction } from "@/app/actions/vtex-actions"

interface Notification {
  message: string
  type: "success" | "error"
}

export default function OrderSearchPage() {
  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<Notification | null>(null)

  function showNotification(message: string, type: "success" | "error") {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  function getVTEXCredentials() {
    if (typeof window === "undefined") return null

    const accountName = localStorage.getItem("vtex_account_name") || (window as any).VTEX_ACCOUNT_NAME || "tottoqa"
    const apiKey = localStorage.getItem("vtex_api_key") || (window as any).VTEX_API_KEY || ""
    const apiToken = localStorage.getItem("vtex_api_token") || (window as any).VTEX_API_TOKEN || ""
    const environment = localStorage.getItem("vtex_environment") || (window as any).VTEX_ENVIRONMENT || "myvtex"

    return { accountName, apiKey, apiToken, environment }
  }

  async function handleSearch() {
    if (!orderId.trim()) {
      showNotification("Por favor ingresa un ID de orden", "error")
      return
    }

    setLoading(true)
    try {
      const credentials = getVTEXCredentials()
      if (!credentials) {
        throw new Error("No se encontraron credenciales de VTEX")
      }

      const { accountName, apiKey, apiToken, environment } = credentials

      const params = new URLSearchParams({
        accountName,
        apiKey,
        apiToken,
        environment,
      })

      const result = await getOrderAction(orderId)

      console.log(result)    

      const data = result.data
      
      setOrder(data)
      showNotification(`Orden ${orderId} cargada exitosamente`, "success")
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "No se pudo encontrar la orden", "error")
      setOrder(null)
    }
    setLoading(false)
  }

  function getStatusColor(status: string) {
    const statusColors: Record<string, string> = {
      "payment-pending": "bg-yellow-500",
      "payment-approved": "bg-green-500",
      "ready-for-handling": "bg-blue-500",
      handling: "bg-blue-600",
      invoiced: "bg-purple-500",
      canceled: "bg-red-500",
    }
    return statusColors[status] || "bg-gray-500"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Búsqueda de Orden</h1>
        <p className="text-muted-foreground">Busca una orden específica por su ID</p>
      </div>

      {notification && (
        <Alert variant={notification.type === "error" ? "destructive" : "default"}>
          {notification.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Orden</CardTitle>
          <CardDescription>Ingresa el ID de la orden que deseas consultar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="orderId">ID de Orden</Label>
              <Input
                id="orderId"
                placeholder="Ej: 1234567890123-01"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                {loading ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      {order && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* General Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">ID de Orden</Label>
                <p className="font-mono font-semibold">{order.orderId}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Estado</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Secuencia</Label>
                <p className="font-semibold">{order.sequence}</p>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-muted-foreground">Fecha de Creación</Label>
                  <p className="text-sm">{new Date(order.creationDate).toLocaleString("es-ES")}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Valor Total</Label>
                <p className="text-2xl font-bold">
                  $
                  {(order.value / 100).toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.clientProfileData && (
                <>
                  <div>
                    <Label className="text-muted-foreground">Nombre</Label>
                    <p className="font-semibold">
                      {order.clientProfileData.firstName} {order.clientProfileData.lastName}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-sm">{order.clientProfileData.email}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Teléfono</Label>
                    <p className="text-sm">{order.clientProfileData.phone}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Documento</Label>
                    <p className="text-sm font-mono">{order.clientProfileData.document}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingData?.address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{order.shippingData.address.receiverName}</p>
                <p className="text-sm">
                  {order.shippingData.address.street}, {order.shippingData.address.number}
                </p>
                {order.shippingData.address.complement && (
                  <p className="text-sm">{order.shippingData.address.complement}</p>
                )}
                <p className="text-sm">
                  {order.shippingData.address.neighborhood}, {order.shippingData.address.city}
                </p>
                <p className="text-sm">
                  {order.shippingData.address.state} - {order.shippingData.address.postalCode}
                </p>
                <p className="text-sm">{order.shippingData.address.country}</p>
              </CardContent>
            </Card>
          )}

          {/* Payment Info */}
          {order.paymentData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Información de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.paymentData.transactions?.map((transaction: any, index: number) => (
                  <div key={index} className="space-y-2">
                    {transaction.payments?.map((payment: any, pIndex: number) => (
                      <div key={pIndex} className="border-l-2 border-primary pl-4">
                        <p className="font-semibold">{payment.paymentSystemName}</p>
                        <p className="text-sm text-muted-foreground">
                          $
                          {(payment.value / 100).toLocaleString("es-ES", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {payment.group}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Items */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0">
                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="object-cover" />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sellerSku}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm">Cantidad: {item.quantity}</p>
                        <p className="text-sm font-semibold">
                          $
                          {(item.price / 100).toLocaleString("es-ES", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
