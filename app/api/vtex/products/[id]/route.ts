import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = params instanceof Promise ? await params : params
    
    const { searchParams } = new URL(request.url)
    const accountName = searchParams.get("accountName") || "tottoqa"
    const apiKey = searchParams.get("apiKey")
    const apiToken = searchParams.get("apiToken")
    const environment = searchParams.get("environment") || "myvtex"

    if (!apiKey || !apiToken) {
      return NextResponse.json(
        { error: "Missing VTEX credentials" },
        { status: 400 }
      )
    }

    // Obtener información completa del producto
    const productUrl = `https://${accountName}.${environment}.com/api/catalog_system/pub/products/search/${id}`

    const productResponse = await fetch(productUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-VTEX-API-AppKey": apiKey,
        "X-VTEX-API-AppToken": apiToken,
      },
    })

    if (!productResponse.ok) {
      const errorText = await productResponse.text()
      return NextResponse.json(
        { error: `Product not found: ${errorText}` },
        { status: productResponse.status }
      )
    }

    const productData = await productResponse.json()

    // Formatear la respuesta
    const formattedResponse = {
      productId: productData.Id,
      name: productData.Name,
      description: productData.Description || "",
      brand: productData.BrandId,
      brandName: productData.BrandName || "",
      category: productData.CategoryId,
      categoryName: productData.CategoryName || "",
      refId: productData.RefId,
      isActive: productData.IsActive,
      
      // Imágenes del producto
      images: productData.Images?.map((img: any) => ({
        imageUrl: img.ImageUrl,
        imageName: img.ImageName,
      })) || [],
      
      // SKUs del producto
      skus: productData.Items?.map((item: any) => ({
        sku: item.Id,
        name: item.Name,
        nameComplete: item.NameComplete,
        refId: item.RefId,
        ean: item.Ean,
        
        // Imágenes del SKU
        images: item.Images?.map((img: any) => ({
          imageUrl: img.ImageUrl,
          imageName: img.ImageName,
        })) || [],
        
        isActive: item.IsActive,
        
        // Dimensiones del SKU
        measures: {
          weight: item.WeightKg || 0,
          height: item.Height || 0,
          width: item.Width || 0,
          length: item.Length || 0,
          cubicWeight: item.CubicWeight || 0,
        },
        
        measurementUnit: item.MeasurementUnit,
        unitMultiplier: item.UnitMultiplier,
      })) || [],
      
      // Especificaciones del producto
      specifications: productData.ProductSpecifications?.map((spec: any) => ({
        name: spec.FieldName,
        value: spec.FieldValues,
      })) || [],
    }

    if (!Array.isArray(productData) || productData.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(productData[0])
    
    //return NextResponse.json(productData)
  } catch (error) {
    console.error("❌ Error fetching product detail:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}