"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Package, 
  ChevronsLeft, 
  ChevronsRight,
  Info,
  Ruler,
  Weight,
  Box
} from "lucide-react"
import Image from "next/image"

interface ProductImage {
  imageUrl: string
  imageName: string
}

interface ProductMeasures {
  weight: number
  height: number
  width: number
  length: number
  cubicWeight: number
}

interface ProductSKU {
  sku: number
  name: string
  nameComplete?: string
  refId: string
  ean?: string
  images?: ProductImage[]
  isActive: boolean
  measures: ProductMeasures
  measurementUnit?: string
  unitMultiplier?: number
}

interface ProductSpecification {
  name: string
  value: string[]
}

interface ProductDetail {
  productId: number
  name: string
  description?: string
  brand?: number
  brandName?: string
  category?: number
  categoryName?: string
  refId: string
  isActive: boolean
  images?: ProductImage[]
  skus: ProductSKU[]
  specifications?: ProductSpecification[]
}

interface Notification {
  message: string
  type: "success" | "error"
}

const ITEMS_PER_PAGE = 250

export default function ProductDisplayPage() {
  const [productIds, setProductIds] = useState<number[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [selectedSKU, setSelectedSKU] = useState<ProductSKU | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [notification, setNotification] = useState<Notification | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadProductPage(1)
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  useEffect(() => {
    if (selectedProduct && selectedProduct.skus && selectedProduct.skus.length > 0) {
      const firstActive = selectedProduct.skus.find(sku => sku.isActive) || selectedProduct.skus[0]
      setSelectedSKU(firstActive)
      setCurrentImageIndex(0)
    }
  }, [selectedProduct])

  function getVTEXCredentials() {
    if (typeof window === "undefined") return null

    const accountName = localStorage.getItem("vtex_account_name") || (window as any).VTEX_ACCOUNT_NAME || "tottoqa"
    const apiKey = localStorage.getItem("vtex_api_key") || (window as any).VTEX_API_KEY || "vtexappkey-tottoqa-IGFKQO"
    const apiToken = localStorage.getItem("vtex_api_token") || (window as any).VTEX_API_TOKEN || "VUMMGFNKSOVZTPBYAHDLZLPDKLEZXBRMGQZUHOBWPMMUPKBMJGPIFPZECOJDEQBPLOUEOKEKBYEHNLFAHAFCWBMNSMUMFYZRBJZZTHCVBQXXMJDJASCLFKEKRPJQYMGO"
    const environment = localStorage.getItem("vtex_environment") || (window as any).VTEX_ENVIRONMENT || "myvtex"

    return { accountName, apiKey, apiToken, environment }
  }

  async function vtexFetch(endpoint: string, extraParams?: Record<string, string>) {
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
      ...extraParams,
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

  async function loadProductPage(page: number) {
    setLoading(true)
    setSelectedProduct(null)
    setSelectedProductId(null)
    
    try {
      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE

      const result = await vtexFetch("/products/ids", {
        from: from.toString(),
        to: to.toString(),
      })

      if (result.productIds && Array.isArray(result.productIds)) {
        setProductIds(result.productIds)
        setCurrentPage(page)
        
        if (result.range?.total) {
          setTotalProducts(result.range.total)
          setTotalPages(Math.ceil(result.range.total / ITEMS_PER_PAGE))
        }

        setNotification({
          message: `Página ${page} cargada: ${result.productIds.length} productos`,
          type: "success",
        })

        if (result.productIds.length > 0) {
          await loadProductDetails(result.productIds[0])
        }
      } else {
        throw new Error("No se encontraron productos")
      }
    } catch (error) {
      console.error('❌ Error loading products:', error)
      setNotification({
        message: error instanceof Error ? error.message : "Error al cargar productos",
        type: "error",
      })
    }
    
    setLoading(false)
  }

  async function loadProductDetails(productId: number) {
    console.log('🔍 Loading details for Product ID:', productId)
    
    setSelectedProductId(productId)
    setLoadingProduct(true)
    setSelectedProduct(null)
    setSelectedSKU(null)

    try {
      const data = await vtexFetch(`/products/${productId}`)
      
      // DEBUG: Ver estructura completa
      console.log('📦 Raw response:', JSON.stringify(data, null, 2))
      console.log('✅ Product name:', data?.name)
      console.log('📦 Has productId?', !!data?.productId)
      console.log('📦 SKUs count:', data?.skus?.length || 0)
      console.log('📦 Images count:', data?.images?.length || 0)
      
      if (data && data.productId) {
        setSelectedProduct(data)
        setNotification({
          message: `${data.name} cargado`,
          type: "success",
        })
      } else {
        console.error('❌ Invalid data structure:', data)
        throw new Error("Estructura de datos inválida")
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

  function nextPage() {
    if (currentPage < totalPages) {
      loadProductPage(currentPage + 1)
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      loadProductPage(currentPage - 1)
    }
  }

  function goToFirstPage() {
    loadProductPage(1)
  }

  function goToLastPage() {
    loadProductPage(totalPages)
  }

  function nextImage() {
    const images = (selectedSKU?.images && selectedSKU.images.length > 0) 
      ? selectedSKU.images 
      : selectedProduct?.images || []
    
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }
  }

  function prevImage() {
    const images = (selectedSKU?.images && selectedSKU.images.length > 0)
      ? selectedSKU.images 
      : selectedProduct?.images || []
    
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }
  }

  function handleBuy() {
    if (selectedSKU) {
      setNotification({
        message: `${selectedProduct?.name} agregado al carrito`,
        type: "success",
      })
    }
  }

  // Obtener las imágenes actuales con validación
  const currentImages = (selectedSKU?.images && selectedSKU.images.length > 0)
    ? selectedSKU.images 
    : selectedProduct?.images || []

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

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* Lista de Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <CardDescription>
              {totalProducts > 0 ? (
                <>
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)} de {totalProducts}
                </>
              ) : (
                "Cargando..."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : productIds.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No hay productos</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto pr-2">
                {productIds.map((productId) => (
                  <Button
                    key={productId}
                    variant={selectedProductId === productId ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => loadProductDetails(productId)}
                    disabled={loadingProduct}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Producto #{productId}
                  </Button>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={goToFirstPage} disabled={currentPage === 1 || loading}>
                    <ChevronsLeft className="h-4 w-4 mr-1" />
                    Primera
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToLastPage} disabled={currentPage === totalPages || loading}>
                    Última
                    <ChevronsRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={previousPage} disabled={currentPage === 1 || loading}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <Button variant="outline" onClick={nextPage} disabled={currentPage === totalPages || loading}>
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detalle del Producto */}
        <div className="space-y-6">
          {loadingProduct ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-96 w-full" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : selectedProduct ? (
            <>
              {/* Galería de Imágenes */}
              <Card>
                <CardContent className="p-6">
                  {currentImages.length > 0 ? (
                    <div className="relative">
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={currentImages[currentImageIndex]?.imageUrl || ''}
                          alt={currentImages[currentImageIndex]?.imageName || selectedProduct.name}
                          fill
                          className="object-contain"
                          unoptimized
                          onError={(e) => {
                            console.error('Error loading image:', currentImages[currentImageIndex]?.imageUrl)
                            e.currentTarget.src = '/placeholder.svg'
                          }}
                        />
                      </div>

                      {currentImages.length > 1 && (
                        <>
                          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="rounded-full shadow-lg pointer-events-auto"
                              onClick={prevImage}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="rounded-full shadow-lg pointer-events-auto"
                              onClick={nextImage}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="mt-4 grid grid-cols-6 gap-2">
                            {currentImages.map((img, index) => (
                              <button
                                key={index}
                                className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                                  index === currentImageIndex ? "border-primary" : "border-transparent"
                                }`}
                                onClick={() => setCurrentImageIndex(index)}
                              >
                                <Image
                                  src={img.imageUrl}
                                  alt={img.imageName}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg bg-muted flex flex-col items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Sin imágenes disponibles</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Información del Producto */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-3xl">{selectedProduct.name}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={selectedProduct.isActive ? "default" : "secondary"}>
                          {selectedProduct.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                        {selectedProduct.brandName && (
                          <Badge variant="outline">{selectedProduct.brandName}</Badge>
                        )}
                        {selectedProduct.categoryName && (
                          <Badge variant="outline">{selectedProduct.categoryName}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ID: {selectedProduct.productId} | Ref: {selectedProduct.refId}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Selector de SKU */}
                  {selectedProduct.skus && selectedProduct.skus.length > 1 && (
                    <div>
                      <label className="text-sm font-semibold mb-3 block">
                        Selecciona una variante ({selectedProduct.skus.length} disponibles)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedProduct.skus.map((sku) => (
                          <Button
                            key={sku.sku}
                            variant={selectedSKU?.sku === sku.sku ? "default" : "outline"}
                            className="justify-start h-auto py-3 text-left"
                            onClick={() => {
                              setSelectedSKU(sku)
                              setCurrentImageIndex(0)
                            }}
                          >
                            <div className="w-full">
                              <div className="font-medium">{sku.name}</div>
                              <div className="text-xs opacity-70">
                                SKU: {sku.sku} | Ref: {sku.refId}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSKU && (
                    <>
                      <Separator />

                      <div className="p-4 bg-muted rounded-lg">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">SKU Seleccionado:</span>
                            <Badge>{selectedSKU.name}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {selectedSKU.sku} | Ref: {selectedSKU.refId}
                            {selectedSKU.ean && ` | EAN: ${selectedSKU.ean}`}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant={selectedSKU.isActive ? "default" : "secondary"}>
                              {selectedSKU.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleBuy}
                        disabled={!selectedSKU.isActive}
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {selectedSKU.isActive ? "Agregar al Carrito" : "Producto no disponible"}
                      </Button>
                    </>
                  )}

                  {/* Tabs con información */}
                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="description">Descripción</TabsTrigger>
                      <TabsTrigger value="specs">Especificaciones</TabsTrigger>
                      <TabsTrigger value="measures">Medidas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="space-y-4 mt-4">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Descripción del producto
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {selectedProduct.description || "No hay descripción disponible"}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="specs" className="space-y-4 mt-4">
                      {selectedProduct.specifications && selectedProduct.specifications.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Box className="h-4 w-4" />
                            Especificaciones técnicas
                          </h4>
                          {selectedProduct.specifications.map((spec, index) => (
                            <div key={index} className="flex justify-between items-start py-2 border-b">
                              <span className="font-medium text-sm">{spec.name}</span>
                              <span className="text-sm text-muted-foreground text-right">
                                {Array.isArray(spec.value) ? spec.value.join(", ") : spec.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No hay especificaciones disponibles
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="measures" className="space-y-4 mt-4">
                      {selectedSKU ? (
                        <div className="space-y-3">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Ruler className="h-4 w-4" />
                            Dimensiones y peso
                          </h4>
                          <div className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center gap-2">
                              <Weight className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">Peso</span>
                            </div>
                            <span className="text-sm">{selectedSKU.measures.weight} kg</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-medium text-sm">Alto</span>
                            <span className="text-sm">{selectedSKU.measures.height} cm</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-medium text-sm">Ancho</span>
                            <span className="text-sm">{selectedSKU.measures.width} cm</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-medium text-sm">Largo</span>
                            <span className="text-sm">{selectedSKU.measures.length} cm</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-medium text-sm">Peso cúbico</span>
                            <span className="text-sm">{selectedSKU.measures.cubicWeight} kg</span>
                          </div>
                          {selectedSKU.measurementUnit && (
                            <div className="flex items-center justify-between py-2">
                              <span className="font-medium text-sm">Unidad de medida</span>
                              <span className="text-sm">{selectedSKU.measurementUnit}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Selecciona un SKU para ver sus medidas
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <Package className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">Selecciona un producto</p>
                <p className="text-sm">para ver sus detalles</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}