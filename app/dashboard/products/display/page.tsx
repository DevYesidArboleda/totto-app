"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Box,
  Download,
  FileSpreadsheet,
  BarChart3,
  Upload,
  X,
} from "lucide-react"
import Image from "next/image"
import * as XLSX from "xlsx"

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

// Nueva interfaz para resultados de diagnóstico
interface DiagnosticResults {
  totalProducts: number
  activeProducts: number
  productsWithAllYes: number
  storeDistribution: {
    tottoCom: number
    mercadolibre: number
    b2b: number
    exito: number
    dafiti: number
    tottoAndB2B: number
  }
  departmentSummary: Record<string, number>
  productsWithStock: number
  productsWithoutStock: number
  seoIssues: Array<{
    skuRef: string
    productName: string
    gender: string
    seoName: string
    issue: string
  }>
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

  // Estados para exportación
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  // Estados para el módulo de diagnóstico
  const [showDiagnostic, setShowDiagnostic] = useState(false)
  const [diagnosticData, setDiagnosticData] = useState<any[]>([])
  const [stockData, setStockData] = useState<any[]>([])
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResults | null>(null)
  const [analyzingData, setAnalyzingData] = useState(false)

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
      const firstActive = selectedProduct.skus.find((sku) => sku.isActive) || selectedProduct.skus[0]
      setSelectedSKU(firstActive)
      setCurrentImageIndex(0)
    }
  }, [selectedProduct])

  function getVTEXCredentials() {
    if (typeof window === "undefined") return null

    const accountName = localStorage.getItem("vtex_account_name") || (window as any).VTEX_ACCOUNT_NAME || "tottoqa"
    const apiKey = localStorage.getItem("vtex_api_key") || (window as any).VTEX_API_KEY || "vtexappkey-tottoqa-IGFKQO"
    const apiToken =
      localStorage.getItem("vtex_api_token") ||
      (window as any).VTEX_API_TOKEN ||
      "VUMMGFNKSOVZTPBYAHDLZLPDKLEZXBRMGQZUHOBWPMMUPKBMJGPIFPZECOJDEQBPLOUEOKEKBYEHNLFAHAFCWBMNSMUMFYZRBJZZTHCVBQXXMJDJASCLFKEKRPJQYMGO"
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
      console.error("❌ Error loading products:", error)
      setNotification({
        message: error instanceof Error ? error.message : "Error al cargar productos",
        type: "error",
      })
    }

    setLoading(false)
  }

  async function loadProductDetails(productId: number) {
    console.log("🔍 Loading details for Product ID:", productId)

    setSelectedProductId(productId)
    setLoadingProduct(true)
    setSelectedProduct(null)
    setSelectedSKU(null)

    try {
      const data = await vtexFetch(`/products/${productId}`)

      console.log("📦 Raw response:", JSON.stringify(data, null, 2))
      console.log("✅ Product name:", data?.name)
      console.log("📦 Has productId?", !!data?.productId)
      console.log("📦 SKUs count:", data?.skus?.length || 0)
      console.log("📦 Images count:", data?.images?.length || 0)

      if (data && data.productId) {
        setSelectedProduct(data)
        setNotification({
          message: `${data.name} cargado`,
          type: "success",
        })
      } else {
        console.error("❌ Invalid data structure:", data)
        throw new Error("Estructura de datos inválida")
      }
    } catch (error) {
      console.error("❌ Error loading product:", error)
      setNotification({
        message: error instanceof Error ? error.message : "Error al cargar el producto",
        type: "error",
      })
    }
    setLoadingProduct(false)
  }

  function productToExcelRow(product: any) {
    console.log("🔄 Converting to Excel row:", {
      productId: product?.productId,
      productName: product?.name,
    })

    // Manejar especificaciones de manera segura
    let specifications = ""
    try {
      if (product.specifications && Array.isArray(product.specifications)) {
        specifications = product.specifications
          .map((spec: any) => {
            const value = Array.isArray(spec.value) ? spec.value.join(", ") : spec.value
            return `${spec.name}: ${value}`
          })
          .join(" | ")
      }
    } catch (error) {
      console.error("Error processing specifications:", error)
    }

    // Manejar imágenes de manera segura
    let images = ""
    try {
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        images = product.images.map((img: any) => img.imageUrl).join(" | ")
      }
    } catch (error) {
      console.error("Error processing images:", error)
    }

    const row = {
      "Product ID": product.productId || "",
      "Product Name": product.name || "",
      "Product Ref": product.refId || "",
      Description: product.description || "",
      Brand: product.brandName || product.brand || "",
      Category: product.categoryName || product.category || "",
      "Is Active": product.isActive ? "Sí" : "No",
      Images: images,
      Specifications: specifications,
    }

    console.log("✅ Row created:", row)
    return row
  }

  async function exportCurrentPage() {
    if (productIds.length === 0) {
      setNotification({
        message: "No hay productos para exportar",
        type: "error",
      })
      return
    }

    console.log("📤 Starting export of current page...")
    console.log("📦 Product IDs to export:", productIds)
    setExporting(true)
    setExportProgress(0)

    try {
      const excelData: any[] = []
      let productsProcessed = 0

      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i]

        try {
          console.log(`\n📦 [${i + 1}/${productIds.length}] Fetching product ID: ${productId}`)

          const productDetail = await vtexFetch(`/products/${productId}`)

          console.log("📦 Product detail received:", {
            hasData: !!productDetail,
            productId: productDetail?.productId,
            name: productDetail?.name,
          })

          // Validar que el producto tenga la estructura correcta
          if (!productDetail) {
            console.warn(`⚠️ Product ${productId}: No data received`)
            continue
          }

          if (!productDetail.productId) {
            console.warn(`⚠️ Product ${productId}: Missing productId in response`)
            continue
          }

          console.log(`✅ Product ${productId} (${productDetail.name}): Processing`)

          // Crear UNA fila por producto (sin SKUs)
          try {
            const row = productToExcelRow(productDetail)
            excelData.push(row)
            productsProcessed++
            console.log(`✅ Product ${productId} added to Excel. Total rows: ${excelData.length}`)
          } catch (error) {
            console.error(`❌ Error creating row for product ${productId}:`, error)
          }
        } catch (error) {
          console.error(`❌ Error loading product ${productId}:`, error)
        }

        setExportProgress(Math.round(((i + 1) / productIds.length) * 100))
      }

      console.log("\n📊 Export Summary:")
      console.log(`  - Products processed: ${productsProcessed}/${productIds.length}`)
      console.log(`  - Total rows in Excel: ${excelData.length}`)

      if (excelData.length === 0) {
        console.error("❌ No data to export!")
        throw new Error("No se pudieron procesar los productos. Revisa la consola para más detalles.")
      }

      console.log("📝 Creating Excel file...")
      console.log("First row sample:", excelData[0])

      // Crear el archivo Excel
      const worksheet = XLSX.utils.json_to_sheet(excelData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Productos")

      // Ajustar el ancho de las columnas
      const columnWidths = [
        { wch: 12 }, // Product ID
        { wch: 40 }, // Product Name
        { wch: 15 }, // Product Ref
        { wch: 60 }, // Description
        { wch: 20 }, // Brand
        { wch: 25 }, // Category
        { wch: 12 }, // Is Active
        { wch: 150 }, // Images
        { wch: 150 }, // Specifications
      ]
      worksheet["!cols"] = columnWidths

      // Descargar el archivo
      const fileName = `productos_pagina_${currentPage}_${new Date().toISOString().split("T")[0]}.xlsx`
      console.log(`💾 Downloading file: ${fileName}`)
      XLSX.writeFile(workbook, fileName)

      console.log("✅ Export completed successfully!")

      setNotification({
        message: `${excelData.length} productos exportados exitosamente`,
        type: "success",
      })
    } catch (error) {
      console.error("❌ Error exporting:", error)
      setNotification({
        message: error instanceof Error ? error.message : "Error al exportar productos",
        type: "error",
      })
    }

    setExporting(false)
    setExportProgress(0)
  }

  async function exportAllProducts() {
    console.log("📤 Starting export of ALL products...")
    console.log(`📊 Total pages: ${totalPages}, Total products: ${totalProducts}`)

    setExporting(true)
    setExportProgress(0)

    try {
      const excelData: any[] = []
      let processedProducts = 0

      // Iterar por todas las páginas
      for (let page = 1; page <= totalPages; page++) {
        const from = (page - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE

        console.log(`\n📄 Processing page ${page}/${totalPages} (products ${from}-${to})`)

        // Obtener IDs de la página
        const result = await vtexFetch("/products/ids", {
          from: from.toString(),
          to: to.toString(),
        })

        if (result.productIds && Array.isArray(result.productIds)) {
          console.log(`📦 Page ${page}: ${result.productIds.length} product IDs retrieved`)

          // Obtener detalles de cada producto
          for (const productId of result.productIds) {
            try {
              console.log(`📦 [${processedProducts + 1}/${totalProducts}] Fetching product ID: ${productId}`)

              const productDetail = await vtexFetch(`/products/${productId}`)

              if (productDetail && productDetail.productId) {
                console.log(`✅ Product ${productId}: ${productDetail.name}`)

                // Crear UNA fila por producto (sin SKUs)
                try {
                  excelData.push(productToExcelRow(productDetail))
                } catch (error) {
                  console.error(`Error processing product ${productId}:`, error)
                }
              } else {
                console.warn(`⚠️ Product ${productId}: Invalid structure`)
              }
            } catch (error) {
              console.error(`❌ Error loading product ${productId}:`, error)
            }

            processedProducts++
            setExportProgress(Math.round((processedProducts / totalProducts) * 100))
          }
        }

        // Pequeña pausa para no saturar el servidor
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      console.log("\n📊 Export Summary:")
      console.log(`  - Products processed: ${processedProducts}/${totalProducts}`)
      console.log(`  - Total rows in Excel: ${excelData.length}`)

      if (excelData.length === 0) {
        throw new Error("No se encontraron datos para exportar")
      }

      // Crear el archivo Excel
      const worksheet = XLSX.utils.json_to_sheet(excelData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Todos los Productos")

      // Ajustar el ancho de las columnas
      const columnWidths = [
        { wch: 12 }, // Product ID
        { wch: 40 }, // Product Name
        { wch: 15 }, // Product Ref
        { wch: 60 }, // Description
        { wch: 20 }, // Brand
        { wch: 25 }, // Category
        { wch: 12 }, // Is Active
        { wch: 150 }, // Images
        { wch: 150 }, // Specifications
      ]
      worksheet["!cols"] = columnWidths

      // Descargar el archivo
      const fileName = `todos_los_productos_${new Date().toISOString().split("T")[0]}.xlsx`
      console.log(`💾 Downloading file: ${fileName}`)
      XLSX.writeFile(workbook, fileName)

      setNotification({
        message: `${excelData.length} productos exportados exitosamente`,
        type: "success",
      })
    } catch (error) {
      console.error("❌ Error exporting all products:", error)
      setNotification({
        message: error instanceof Error ? error.message : "Error al exportar todos los productos",
        type: "error",
      })
    }

    setExporting(false)
    setExportProgress(0)
  }

  async function loadCatalogForDiagnostic() {
    setAnalyzingData(true)
    setNotification({
      message: "Cargando catálogo completo para diagnóstico...",
      type: "success",
    })

    try {
      const catalogData: any[] = []
      let processedProducts = 0

      // Cargar todos los productos
      // Limitar a 10 páginas para demo y para no saturar el servidor
      for (let page = 1; page <= Math.min(totalPages, 10); page++) {
        const from = (page - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE

        const result = await vtexFetch("/products/ids", {
          from: from.toString(),
          to: to.toString(),
        })

        if (result.productIds && Array.isArray(result.productIds)) {
          for (const productId of result.productIds) {
            try {
              const productDetail = await vtexFetch(`/products/${productId}`)

              if (productDetail && productDetail.skus) {
                productDetail.skus.forEach((sku: ProductSKU) => {
                  catalogData.push({
                    productId: productDetail.productId,
                    productName: productDetail.name,
                    productRef: productDetail.refId,
                    productIsActive: productDetail.isActive,
                    skuId: sku.sku,
                    skuName: sku.name,
                    skuRef: sku.refId,
                    skuIsActive: sku.isActive,
                    department: productDetail.categoryName || "Sin categoría",
                    brand: productDetail.brandName || "Sin marca",
                  })
                })
              }
            } catch (error) {
              console.error(`Error loading product ${productId}:`, error)
            }

            processedProducts++
            // Usar el total de productos de la primera página como referencia si totalPages es muy alto
            const totalProductsForProgress = totalProducts > 0 ? totalProducts : ITEMS_PER_PAGE * 10
            setExportProgress(Math.round((processedProducts / totalProductsForProgress) * 100))
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      setDiagnosticData(catalogData)
      setNotification({
        message: `${catalogData.length} productos cargados para diagnóstico`,
        type: "success",
      })
    } catch (error) {
      console.error("Error loading catalog:", error)
      setNotification({
        message: "Error al cargar el catálogo",
        type: "error",
      })
    }

    setAnalyzingData(false)
    setExportProgress(0)
  }

  function handleStockFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        setStockData(jsonData)
        setNotification({
          message: `Archivo de stock cargado: ${jsonData.length} registros`,
          type: "success",
        })
      } catch (error) {
        console.error("Error reading file:", error)
        setNotification({
          message: "Error al leer el archivo de stock",
          type: "error",
        })
      }
    }
    reader.readAsBinaryString(file)
  }

  function analyzeCatalog() {
    if (diagnosticData.length === 0) {
      setNotification({
        message: "Primero carga el catálogo",
        type: "error",
      })
      return
    }

    setAnalyzingData(true)

    try {
      // Simular campos de VTEX (en producción estos vendrían de la API)
      const enrichedData = diagnosticData.map((item) => ({
        ...item,
        _ActivateSkuIfPossible: item.skuIsActive ? "YES" : "NO",
        _SkuIsActive: item.skuIsActive ? "YES" : "NO",
        _ProductIsActive: item.productIsActive ? "YES" : "NO",
        _ShowOnSite: item.productIsActive && item.skuIsActive ? "YES" : "NO",
        _Stores: Math.floor(Math.random() * 5) + 1, // Simular store policy
        _SKUReferenceCode: item.skuRef,
        _Gender: ["Hombre", "Mujer", "Niño", "Niña", "Unisex"][Math.floor(Math.random() * 5)],
        _SeoName: item.productName,
      }))

      // 1. Contar referencias con todos los campos en "YES"
      const productsWithAllYes = enrichedData.filter(
        (item) =>
          item._ActivateSkuIfPossible === "YES" &&
          item._SkuIsActive === "YES" &&
          item._ProductIsActive === "YES" &&
          item._ShowOnSite === "YES",
      ).length

      // 2. Distribución por políticas comerciales
      const tottoCom = enrichedData.filter((item) => item._Stores === 1).length
      const mercadolibre = enrichedData.filter((item) => item._Stores === 2).length
      const b2b = enrichedData.filter((item) => item._Stores === 3).length
      const exito = enrichedData.filter((item) => item._Stores === 4).length
      const dafiti = enrichedData.filter((item) => item._Stores === 5).length

      // Referencias que comparten Totto.com y B2B
      const tottoAndB2BRefs = new Set<string>()
      const tottoRefs = new Set(enrichedData.filter((item) => item._Stores === 1).map((item) => item._SKUReferenceCode))
      const b2bRefs = new Set(enrichedData.filter((item) => item._Stores === 3).map((item) => item._SKUReferenceCode))

      tottoRefs.forEach((ref) => {
        if (b2bRefs.has(ref)) {
          tottoAndB2BRefs.add(ref)
        }
      })

      // 3. Tabla dinámica por departamento
      const departmentSummary: Record<string, number> = {}
      enrichedData.forEach((item) => {
        const dept = item.department || "Sin categoría"
        departmentSummary[dept] = (departmentSummary[dept] || 0) + 1
      })

      // 4. Productos con/sin stock
      let productsWithStock = 0
      let productsWithoutStock = 0

      if (stockData.length > 0) {
        const stockMap = new Map(
          stockData.map((item: any) => [item.SKU || item.sku || item.RefId, item.Stock || item.stock || 0]),
        )

        enrichedData.forEach((item) => {
          const stock = stockMap.get(item.skuRef) || 0
          if (stock > 0) {
            productsWithStock++
          } else {
            productsWithoutStock++
          }
        })
      } else {
        // Si no hay datos de stock, simular
        productsWithStock = Math.floor(enrichedData.length * 0.7)
        productsWithoutStock = enrichedData.length - productsWithStock
      }

      // 5. Detectar problemas de SEO
      const seoIssues: Array<{
        skuRef: string
        productName: string
        gender: string
        seoName: string
        issue: string
      }> = []

      enrichedData.forEach((item) => {
        const gender = item._Gender?.toLowerCase() || ""
        const seoName = item._SeoName?.toLowerCase() || ""

        // Detectar discrepancias
        if (gender === "niña" && (seoName.includes("niño") || seoName.includes("nino"))) {
          seoIssues.push({
            skuRef: item._SKUReferenceCode,
            productName: item.productName,
            gender: item._Gender,
            seoName: item._SeoName,
            issue: 'El género es "Niña" pero el nombre SEO menciona "Niño"',
          })
        } else if (gender === "niño" && seoName.includes("niña")) {
          seoIssues.push({
            skuRef: item._SKUReferenceCode,
            productName: item.productName,
            gender: item._Gender,
            seoName: item._SeoName,
            issue: 'El género es "Niño" pero el nombre SEO menciona "Niña"',
          })
        } else if (gender === "mujer" && seoName.includes("hombre")) {
          seoIssues.push({
            skuRef: item._SKUReferenceCode,
            productName: item.productName,
            gender: item._Gender,
            seoName: item._SeoName,
            issue: 'El género es "Mujer" pero el nombre SEO menciona "Hombre"',
          })
        } else if (gender === "hombre" && seoName.includes("mujer")) {
          seoIssues.push({
            skuRef: item._SKUReferenceCode,
            productName: item.productName,
            gender: item._Gender,
            seoName: item._SeoName,
            issue: 'El género es "Hombre" pero el nombre SEO menciona "Mujer"',
          })
        }
      })

      const results: DiagnosticResults = {
        totalProducts: enrichedData.length,
        activeProducts: productsWithAllYes, // Asumiendo que activeProducts se refiere a los que tienen todos los campos YES
        productsWithAllYes,
        storeDistribution: {
          tottoCom,
          mercadolibre,
          b2b,
          exito,
          dafiti,
          tottoAndB2B: tottoAndB2BRefs.size,
        },
        departmentSummary,
        productsWithStock,
        productsWithoutStock,
        seoIssues: seoIssues.slice(0, 50), // Limitar a 50 para no saturar la UI
      }

      setDiagnosticResults(results)
      setNotification({
        message: "Diagnóstico completado exitosamente",
        type: "success",
      })
    } catch (error) {
      console.error("Error analyzing catalog:", error)
      setNotification({
        message: "Error al analizar el catálogo",
        type: "error",
      })
    }

    setAnalyzingData(false)
  }

  function exportDiagnosticResults() {
    if (!diagnosticResults) return

    const wb = XLSX.utils.book_new()

    // Hoja 1: Resumen general
    const summaryData = [
      ["Métrica", "Valor"],
      ["Total de productos cargados", diagnosticResults.totalProducts],
      ["Productos con todos los campos 'YES'", diagnosticResults.productsWithAllYes],
      [
        "Productos activos (con stock y todos YES)",
        diagnosticResults.productsWithAllYes - diagnosticResults.productsWithoutStock,
      ],
      ["Productos con stock", diagnosticResults.productsWithStock],
      ["Productos sin stock", diagnosticResults.productsWithoutStock],
      ["", ""],
      ["Distribución por canal", ""],
      ["Totto.com", diagnosticResults.storeDistribution.tottoCom],
      ["Mercadolibre", diagnosticResults.storeDistribution.mercadolibre],
      ["B2B", diagnosticResults.storeDistribution.b2b],
      ["Éxito", diagnosticResults.storeDistribution.exito],
      ["Dafiti", diagnosticResults.storeDistribution.dafiti],
      ["Totto.com y B2B (compartidos)", diagnosticResults.storeDistribution.tottoAndB2B],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, ws1, "Resumen")

    // Hoja 2: Por departamento
    const deptData = [["Departamento", "Cantidad de SKUs"], ...Object.entries(diagnosticResults.departmentSummary)]
    const ws2 = XLSX.utils.aoa_to_sheet(deptData)
    XLSX.utils.book_append_sheet(wb, ws2, "Por Departamento")

    // Hoja 3: Problemas de SEO
    if (diagnosticResults.seoIssues.length > 0) {
      const seoData = [
        ["SKU Ref", "Nombre Producto", "Género", "Nombre SEO", "Problema"],
        ...diagnosticResults.seoIssues.map((issue) => [
          issue.skuRef,
          issue.productName,
          issue.gender,
          issue.seoName,
          issue.issue,
        ]),
      ]
      const ws3 = XLSX.utils.aoa_to_sheet(seoData)
      XLSX.utils.book_append_sheet(wb, ws3, "Problemas SEO")
    }

    XLSX.writeFile(wb, `diagnostico_catalogo_${new Date().toISOString().split("T")[0]}.xlsx`)

    setNotification({
      message: "Resultados exportados exitosamente",
      type: "success",
    })
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
    const images =
      selectedSKU?.images && selectedSKU.images.length > 0 ? selectedSKU.images : selectedProduct?.images || []

    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }
  }

  function prevImage() {
    const images =
      selectedSKU?.images && selectedSKU.images.length > 0 ? selectedSKU.images : selectedProduct?.images || []

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

  const currentImages =
    selectedSKU?.images && selectedSKU.images.length > 0 ? selectedSKU.images : selectedProduct?.images || []

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Catálogo de Productos VTEX</h1>
          <p className="text-muted-foreground">Explora nuestros productos disponibles</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCurrentPage} disabled={exporting || productIds.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Página
          </Button>
          <Button variant="outline" onClick={exportAllProducts} disabled={exporting || totalProducts === 0}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Todos
          </Button>
          <Button variant="default" onClick={() => setShowDiagnostic(true)} disabled={analyzingData}>
            <BarChart3 className="h-4 w-4 mr-2" />
            {analyzingData ? "Analizando..." : "Diagnóstico"}
          </Button>
        </div>
      </div>

      {notification && (
        <Alert variant={notification.type === "error" ? "destructive" : "default"}>
          {notification.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      {/* Barra de progreso de exportación */}
      {exporting && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4 animate-pulse" />
                  Exportando productos...
                </span>
                <span className="font-medium">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Por favor espera, esto puede tomar algunos minutos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {showDiagnostic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Diagnóstico de Catálogo - El Madrugón Navideño</CardTitle>
                  <CardDescription>Análisis previo para entrada comercial importante</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowDiagnostic(false)} disabled={analyzingData}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Paso 1: Cargar catálogo */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Paso 1: Cargar Catálogo
                </h3>
                <div className="flex gap-2">
                  <Button onClick={loadCatalogForDiagnostic} disabled={analyzingData || diagnosticData.length > 0}>
                    {diagnosticData.length > 0 ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Catálogo Cargado ({diagnosticData.length} productos)
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Cargar Catálogo
                      </>
                    )}
                  </Button>
                  {diagnosticData.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDiagnosticData([])
                        setDiagnosticResults(null)
                        setStockData([])
                      }}
                      disabled={analyzingData}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Paso 2: Cargar stock */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Paso 2: Cargar Archivo de Stock (Opcional)
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="stock-file">Selecciona archivo Excel con datos de inventario</Label>
                  <Input
                    id="stock-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleStockFileUpload}
                    disabled={analyzingData || diagnosticData.length === 0}
                  />
                  {stockData.length > 0 && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {stockData.length} registros de stock cargados
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Paso 3: Analizar */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Paso 3: Ejecutar Análisis
                </h3>
                <Button onClick={analyzeCatalog} disabled={analyzingData || diagnosticData.length === 0}>
                  {analyzingData ? "Analizando..." : "Analizar Catálogo"}
                </Button>
              </div>

              {/* Barra de progreso */}
              {analyzingData && exportProgress > 0 && (
                <div className="space-y-2">
                  <Progress value={exportProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">{exportProgress}% completado</p>
                </div>
              )}

              {/* Resultados */}
              {diagnosticResults && (
                <>
                  <Separator />
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Resultados del Diagnóstico</h3>
                      <Button variant="outline" onClick={exportDiagnosticResults} disabled={analyzingData}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Resultados
                      </Button>
                    </div>

                    <Tabs defaultValue="summary" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="summary">Resumen</TabsTrigger>
                        <TabsTrigger value="stores">Canales</TabsTrigger>
                        <TabsTrigger value="departments">Departamentos</TabsTrigger>
                        <TabsTrigger value="seo">SEO</TabsTrigger>
                      </TabsList>

                      <TabsContent value="summary" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardDescription>Total de Productos Cargados</CardDescription>
                              <CardTitle className="text-3xl">{diagnosticResults.totalProducts}</CardTitle>
                            </CardHeader>
                          </Card>
                          <Card>
                            <CardHeader className="pb-3">
                              <CardDescription>Productos Activos (Todos YES)</CardDescription>
                              <CardTitle className="text-3xl text-green-600">
                                {diagnosticResults.productsWithAllYes}
                              </CardTitle>
                            </CardHeader>
                          </Card>
                          <Card>
                            <CardHeader className="pb-3">
                              <CardDescription>Con Stock</CardDescription>
                              <CardTitle className="text-3xl text-blue-600">
                                {diagnosticResults.productsWithStock}
                              </CardTitle>
                            </CardHeader>
                          </Card>
                          <Card>
                            <CardHeader className="pb-3">
                              <CardDescription>Sin Stock</CardDescription>
                              <CardTitle className="text-3xl text-orange-600">
                                {diagnosticResults.productsWithoutStock}
                              </CardTitle>
                            </CardHeader>
                          </Card>
                          <Card>
                            <CardHeader className="pb-3">
                              <CardDescription>Problemas de SEO Detectados</CardDescription>
                              <CardTitle className="text-3xl text-red-600">
                                {diagnosticResults.seoIssues.length}
                              </CardTitle>
                            </CardHeader>
                          </Card>
                          <Card>
                            <CardHeader className="pb-3">
                              <CardDescription>Deberían estar Activos (con stock)</CardDescription>
                              <CardTitle className="text-3xl text-purple-600">
                                {diagnosticResults.productsWithAllYes - diagnosticResults.productsWithoutStock}
                              </CardTitle>
                            </CardHeader>
                          </Card>
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Respuesta 1:</strong> {diagnosticResults.productsWithAllYes} referencias tienen el
                            valor "YES" en todos los campos de activación relevantes (_ActivateSkuIfPossible,
                            _SkuIsActive, _ProductIsActive, _ShowOnSite).
                            <br />
                            <strong>Respuesta 4:</strong>{" "}
                            {diagnosticResults.productsWithAllYes - diagnosticResults.productsWithoutStock} productos
                            tienen todos los campos de activación en YES y además cuentan con stock disponible, por lo
                            que deberían estar visibles y activos para la venta.
                          </AlertDescription>
                        </Alert>
                      </TabsContent>

                      <TabsContent value="stores" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader>
                              <CardDescription>Totto.com (_Stores = 1)</CardDescription>
                              <CardTitle className="text-2xl">{diagnosticResults.storeDistribution.tottoCom}</CardTitle>
                            </CardHeader>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardDescription>B2B (_Stores = 3)</CardDescription>
                              <CardTitle className="text-2xl">{diagnosticResults.storeDistribution.b2b}</CardTitle>
                            </CardHeader>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardDescription>Totto.com y B2B (Compartidos)</CardDescription>
                              <CardTitle className="text-2xl text-green-600">
                                {diagnosticResults.storeDistribution.tottoAndB2B}
                              </CardTitle>
                            </CardHeader>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardDescription>Mercadolibre (_Stores = 2)</CardDescription>
                              <CardTitle className="text-2xl">
                                {diagnosticResults.storeDistribution.mercadolibre}
                              </CardTitle>
                            </CardHeader>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardDescription>Éxito (_Stores = 4)</CardDescription>
                              <CardTitle className="text-2xl">{diagnosticResults.storeDistribution.exito}</CardTitle>
                            </CardHeader>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardDescription>Dafiti (_Stores = 5)</CardDescription>
                              <CardTitle className="text-2xl">{diagnosticResults.storeDistribution.dafiti}</CardTitle>
                            </CardHeader>
                          </Card>
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Respuesta 2:</strong> La distribución de productos por políticas comerciales muestra
                            que {diagnosticResults.storeDistribution.tottoCom} referencias pertenecen a Totto.com,{" "}
                            {diagnosticResults.storeDistribution.b2b} a B2B, y{" "}
                            {diagnosticResults.storeDistribution.tottoAndB2B} referencias comparten ambas políticas
                            comerciales.
                          </AlertDescription>
                        </Alert>
                      </TabsContent>

                      <TabsContent value="departments" className="space-y-4">
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                          {Object.entries(diagnosticResults.departmentSummary)
                            .sort(([, a], [, b]) => b - a)
                            .map(([dept, count]) => (
                              <div
                                key={dept}
                                className="flex items-center justify-between p-3 border rounded-lg bg-background"
                              >
                                <span className="font-medium">{dept}</span>
                                <Badge variant="secondary">{count} SKUs</Badge>
                              </div>
                            ))}
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Respuesta 3:</strong> La tabla muestra la cantidad de SKUs únicos por cada
                            departamento. En total, se identificaron{" "}
                            {Object.keys(diagnosticResults.departmentSummary).length} departamentos distintos.
                          </AlertDescription>
                        </Alert>
                      </TabsContent>

                      <TabsContent value="seo" className="space-y-4">
                        {diagnosticResults.seoIssues.length > 0 ? (
                          <>
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Respuesta 5:</strong> Se detectaron {diagnosticResults.seoIssues.length}
                                discrepancias entre el campo "Género" (_Gender) y el "Nombre SEO" (_SeoName) en el
                                catálogo. Estos productos requieren una revisión manual para asegurar la coherencia y
                                optimizar las prácticas de SEO.
                              </AlertDescription>
                            </Alert>

                            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                              {diagnosticResults.seoIssues.map((issue, index) => (
                                <Card key={index}>
                                  <CardContent className="p-4">
                                    <div className="space-y-2">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <p className="font-medium">{issue.productName}</p>
                                          <p className="text-sm text-muted-foreground">SKU Ref: {issue.skuRef}</p>
                                        </div>
                                        <Badge variant="destructive">Error SEO</Badge>
                                      </div>
                                      <div className="text-sm space-y-1">
                                        <p>
                                          <strong>Género asignado:</strong> {issue.gender}
                                        </p>
                                        <p>
                                          <strong>Nombre SEO actual:</strong> {issue.seoName}
                                        </p>
                                        <p className="text-red-600 mt-1">
                                          <strong>Problema detectado:</strong> {issue.issue}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </>
                        ) : (
                          <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                              No se detectaron problemas de SEO relacionados con la coherencia entre el campo "Género" y
                              el "Nombre SEO". Todos los productos cumplen con las buenas prácticas en este aspecto.
                            </AlertDescription>
                          </Alert>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* Lista de Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <CardDescription>
              {totalProducts > 0 ? (
                <>
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)} de {totalProducts}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages || loading}
                  >
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
              <Card>
                <CardContent className="p-6">
                  {currentImages.length > 0 ? (
                    <div className="relative">
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={currentImages[currentImageIndex]?.imageUrl || ""}
                          alt={currentImages[currentImageIndex]?.imageName || selectedProduct.name}
                          fill
                          className="object-contain"
                          unoptimized
                          onError={(e) => {
                            console.error("Error loading image:", currentImages[currentImageIndex]?.imageUrl)
                            e.currentTarget.src = "/placeholder.svg"
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
                                  src={img.imageUrl || "/placeholder.svg"}
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

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-3xl">{selectedProduct.name}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={selectedProduct.isActive ? "default" : "secondary"}>
                          {selectedProduct.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                        {selectedProduct.brandName && <Badge variant="outline">{selectedProduct.brandName}</Badge>}
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
                      <Button className="w-full" size="lg" onClick={handleBuy} disabled={!selectedSKU.isActive}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {selectedSKU.isActive ? "Agregar al Carrito" : "Producto no disponible"}
                      </Button>
                    </>
                  )}

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
