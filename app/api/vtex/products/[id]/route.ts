import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // En Next.js 15+, params es una Promise
    const { id } = await params
    
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

    const url = `https://${accountName}.${environment}.com/api/catalog/pvt/product/${id}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-VTEX-API-AppKey": apiKey,
        "X-VTEX-API-AppToken": apiToken,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `VTEX API Error: ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    console.error("Error fetching product details:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}