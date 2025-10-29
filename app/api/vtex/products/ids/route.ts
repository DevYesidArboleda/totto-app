import { NextResponse } from "next/server"

export async function GET(request: Request) {
  console.log('✅ API Route /api/vtex/products/ids called')
  
  try {
    const { searchParams } = new URL(request.url)
    const accountName = searchParams.get("accountName") || "tottoqa"
    const apiKey = searchParams.get("apiKey")
    const apiToken = searchParams.get("apiToken")
    const environment = searchParams.get("environment") || "myvtex"
    
    // Parámetros de paginación
    const from = searchParams.get("from") || "0"
    const to = searchParams.get("to") || "250"

    if (!apiKey || !apiToken) {
      return NextResponse.json(
        { error: "Missing VTEX credentials" },
        { status: 400 }
      )
    }

    const url = `https://${accountName}.${environment}.com/api/catalog_system/pvt/products/GetProductAndSkuIds?_from=${from}&_to=${to}`
    
    console.log('🌐 Fetching products from', from, 'to', to)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-VTEX-API-AppKey": apiKey,
        "X-VTEX-API-AppToken": apiToken,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `VTEX API Error: ${errorText}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    console.log('📦 Range info:', result.range)
       
    const productIds = Object.keys(result.data || {}).map(id => parseInt(id))
    
    console.log('✅ Product IDs extracted:', productIds.length)
    console.log('📦 Total available:', result.range?.total || 'unknown')
    
    // Retornar también la información de paginación
    return NextResponse.json({
      productIds,
      range: result.range
    })
  } catch (error) {
    console.error("❌ Error fetching product IDs:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}