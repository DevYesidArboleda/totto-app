import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Solo aplica a las rutas de API
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next()

    // Agregar headers CORS
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}