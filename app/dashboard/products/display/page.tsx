"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import Image from "next/image"

interface ProductData {
  Id: number
  Name: string
  Description: string
  Images: Array<{ ImageUrl: string; ImageName: string }>
  CategoryId: number
  BrandId: number
  RefId: string
  IsActive: boolean
}

interface Notification {
  message: string
  type: "success" | "error"
}

export default function ProductDisplayPage() {
  const [productIds, setProductIds] = useState<number[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [notification, setNotification] = useState<Notification | null>(null)

  useEffect(() => {
    loadProductIds()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  function getVTEXCredentials() {
    if (typeof window === "undefined") return null

    const accountName = localStorage.getItem("vtex_account_name") || (window as any).VTEX_ACCOUNT_NAME || "tottoqa"
    const apiKey = localStorage.getItem("vtex_api_key") || (window as any).VTEX_API_KEY || "vtexappkey-tottoqa-IGFKQO"
    const apiToken = localStorage.getItem("vtex_api_token") || (window as any).VTEX_API_TOKEN || "VUMMGFNKSOVZTPBYAHDLZLPDKLEZXBRMGQZUHOBWPMMUPKBMJGPIFPZECOJDEQBPLOUEOKEKBYEHNLFAHAFCWBMNSMUMFYZRBJZZTHCVBQXXMJDJASCLFKEKRPJQYMGO"
    const environment = localStorage.getItem("vtex_environment") || (window as any).VTEX_ENVIRONMENT || "myvtex"


    return { accountName, apiKey, apiToken, environment }
  }

  async function vtexFetch(endpoint: string) {
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

    const proxyUrl = `/api/vtex${endpoint}?${params.toString()}`

    const response = await fetch(proxyUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error ${response.status}`)
    }

    const data = await response.json()
    return data
  }

  async function loadProductIds() {
    setLoading(true)
    try {
      const data = await vtexFetch("/products/ids")
      
      console.log('📦 Product IDs received:', data)
      console.log('📦 Type:', typeof data, 'Is Array:', Array.isArray(data))
      console.log('📦 Length:', data?.length)

      if (Array.isArray(data) && data.length > 0) {
        setProductIds(data)
        setNotification({
          message: `${data.length} productos encontrados`,
          type: "success",
        })
        // Cargar automáticamente el primer producto
        await loadProductDetails(data[0])
      } else {
        setNotification({
          message: "No se encontraron productos",
          type: "error",
        })
      }
    } catch (error) {
      console.error('❌ Error loading product IDs:', error)
      setNotification({
        message: error instanceof Error ? error.message : "Error al cargar productos",
        type: "error",
      })
    }
    setLoading(false)
  }

  async function loadProductDetails(productId: number) {
    console.log('🔍 Loading details for Product ID:', productId, 'Type:', typeof productId)
    
    setSelectedProductId(productId)
    setLoadingProduct(true)
    setCurrentImageIndex(0)
    setSelectedProduct(null)

    try {
      const data = await vtexFetch(`/products/${productId}`)
      console.log('✅ Product loaded:', data?.Name || 'Unknown')
      
      if (data && data.Id) {
        setSelectedProduct(data)
      } else {
        throw new Error("Producto no encontrado o datos inválidos")
      }
    } catch (error) {
      console.error('❌ Error loading product:', error)
      setNotification({
        message: error instanceof Error ? error.message : "Error al cargar el producto",
        type: "error",
      })
    }
    setLoadingProduct(false)
  }

  function nextImage() {
    if (selectedProduct && selectedProduct.Images && selectedProduct.Images.length > 0) {
      setCurrentImageIndex((prev) => (prev === selectedProduct.Images.length - 1 ? 0 : prev + 1))
    }
  }

  function prevImage() {
    if (selectedProduct && selectedProduct.Images && selectedProduct.Images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? selectedProduct.Images.length - 1 : prev - 1))
    }
  }

  function handleBuy() {
    setNotification({
      message: `${selectedProduct?.Name} agregado al carrito`,
      type: "success",
    })
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Catálogo de Productos VTEX</h1>
        <p className="text-muted-foreground">Explora nuestros productos disponibles</p>
      </div>

      {notification && (
        <Alert variant={notification.type === "error" ? "destructive" : "default"}>
          {notification.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Lista de Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Productos</CardTitle>
            <CardDescription>
              {loading ? "Cargando..." : `${productIds.length} productos disponibles`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : productIds.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No hay productos disponibles</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                {productIds.map((productId) => (
                  <Button
                    key={productId}
                    variant={selectedProductId === productId ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => loadProductDetails(productId)}
                    disabled={loadingProduct}
                  >
                    Producto ID: {productId}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detalle del Producto */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Producto</CardTitle>
            <CardDescription>
              {selectedProduct ? selectedProduct.Name : "Selecciona un producto"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProduct ? (
              <div className="space-y-4">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : selectedProduct ? (
              <div className="space-y-6">
                {/* Carrusel de Imágenes */}
                {selectedProduct.Images && selectedProduct.Images.length > 0 ? (
                  <div className="relative">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={selectedProduct.Images[currentImageIndex]?.ImageUrl || "/placeholder.svg"}
                        alt={selectedProduct.Images[currentImageIndex]?.ImageName || selectedProduct.Name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>

                    {selectedProduct.Images.length > 1 && (
                      <>
                        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full shadow-lg"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full shadow-lg"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-4 flex justify-center gap-2">
                          {selectedProduct.Images.map((_, index) => (
                            <button
                              key={index}
                              className={`h-2 w-2 rounded-full transition-all ${
                                index === currentImageIndex ? "bg-primary w-8" : "bg-muted-foreground/30"
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">Sin imagen disponible</p>
                  </div>
                )}

                {/* Información del Producto */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedProduct.Name}</h3>
                    <p className="text-sm text-muted-foreground">Ref: {selectedProduct.RefId}</p>
                  </div>

                  {selectedProduct.Description && (
                    <div>
                      <h4 className="font-semibold mb-2">Descripción</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedProduct.Description}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm border-t pt-4">
                    <div>
                      <span className="font-semibold">ID:</span> {selectedProduct.Id}
                    </div>
                    <div>
                      <span className="font-semibold">Categoría:</span> {selectedProduct.CategoryId}
                    </div>
                    <div>
                      <span className="font-semibold">Marca:</span> {selectedProduct.BrandId}
                    </div>
                    <div>
                      <span className="font-semibold">Estado:</span>{" "}
                      <span className={selectedProduct.IsActive ? "text-green-600" : "text-red-600"}>
                        {selectedProduct.IsActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleBuy}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Agregar al Carrito
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <ShoppingCart className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">Selecciona un producto de la lista</p>
                <p className="text-sm">para ver sus detalles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}