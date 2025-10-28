const VTEX_ACCOUNT = process.env.VTEX_ACCOUNT_NAME || "tottoqa"
const VTEX_ENVIRONMENT = process.env.VTEX_ENVIRONMENT || "myvtex"
const VTEX_API_KEY = process.env.VTEX_API_KEY || "vtexappkey-tottoqa-IGFKQO"
const VTEX_API_TOKEN = process.env.VTEX_API_TOKEN || "VUMMGFNKSOVZTPBYAHDLZLPDKLEZXBRMGQZUHOBWPMMUPKBMJGPIFPZECOJDEQBPLOUEOKEKBYEHNLFAHAFCWBMNSMUMFYZRBJZZTHCVBQXXMJDJASCLFKEKRPJQYMGO"

const BASE_URL = `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br`

interface VTEXRequestOptions extends RequestInit {
  endpoint: string
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
}

async function vtexRequest<T>({ endpoint, method = "GET", ...options }: VTEXRequestOptions): Promise<T> {
  // Check if credentials are configured
  if (!VTEX_ACCOUNT || !VTEX_API_KEY || !VTEX_API_TOKEN) {
    throw new Error("VTEX credentials not configured. Please set up your VTEX account credentials in the settings.")
  }

  const url = `${BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-VTEX-API-AppKey": VTEX_API_KEY,
        "X-VTEX-API-AppToken": VTEX_API_TOKEN,
        ...options.headers,
      },
    })

    // Try to get response text first
    const responseText = await response.text()

    if (!response.ok) {
      // Try to parse as JSON for structured error
      try {
        const errorJson = JSON.parse(responseText)
        throw new Error(`VTEX API Error: ${response.status} - ${JSON.stringify(errorJson)}`)
      } catch {
        // If not JSON, use the text directly
        throw new Error(`VTEX API Error: ${response.status} - ${responseText}`)
      }
    }

    // Try to parse successful response as JSON
    try {
      return JSON.parse(responseText)
    } catch {
      // If response is not JSON, return the text as is
      return responseText as any
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Network error: ${String(error)}`)
  }
}

export const vtexAPI = {
  // Product APIs
  async createProduct(product: any) {
    return vtexRequest({
      endpoint: "/api/catalog/pvt/product",
      method: "POST",
      body: JSON.stringify(product),
    })
  },

  async getProduct(productId: number) {
    return vtexRequest({
      endpoint: `/api/catalog/pvt/product/${productId}`,
      method: "GET",
    })
  },

  async getProductById(productId: string) {
    return vtexRequest({
      endpoint: `/api/catalog/pvt/product/${productId}`,
      method: "GET",
    })
  },

  async getProductAndSkuIds(page = 1, pageSize = 50) {
    return vtexRequest({
      endpoint: `/api/catalog_system/pvt/products/GetProductAndSkuIds?_from=${(page - 1) * pageSize}&_to=${page * pageSize}`,
      method: "GET",
    })
  },

  // SKU APIs
  async createSKU(sku: any) {
    return vtexRequest({
      endpoint: "/api/catalog/pvt/stockkeepingunit",
      method: "POST",
      body: JSON.stringify(sku),
    })
  },

  async getSKU(skuId: number) {
    return vtexRequest({
      endpoint: `/api/catalog/pvt/stockkeepingunit/${skuId}`,
      method: "GET",
    })
  },

  // Image APIs
  async addSKUImage(skuId: number, image: { ImageUrl: string; ImageName: string }) {
    return vtexRequest({
      endpoint: `/api/catalog/pvt/stockkeepingunit/${skuId}/file`,
      method: "POST",
      body: JSON.stringify(image),
    })
  },

  // Inventory APIs
  async updateInventory(skuId: number, warehouseId: string, inventory: any) {
    return vtexRequest({
      endpoint: `/api/logistics/pvt/inventory/skus/${skuId}/warehouses/${warehouseId}`,
      method: "PUT",
      body: JSON.stringify(inventory),
    })
  },

  async getInventory(skuId: number, warehouseId: string) {
    return vtexRequest({
      endpoint: `/api/logistics/pvt/inventory/skus/${skuId}/warehouses/${warehouseId}`,
      method: "GET",
    })
  },

  // Price APIs
  async updatePrice(skuId: number, price: any) {
    return vtexRequest({
      endpoint: `/api/pricing/prices/${skuId}`,
      method: "PUT",
      body: JSON.stringify(price),
    })
  },

  async getPrice(skuId: number) {
    return vtexRequest({
      endpoint: `/api/pricing/prices/${skuId}`,
      method: "GET",
    })
  },

  // Order APIs
  async listOrders(params?: {
    page?: number
    perPage?: number
    orderBy?: string
    f_creationDate?: string
    f_status?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.perPage) queryParams.append("per_page", params.perPage.toString())
    if (params?.orderBy) queryParams.append("orderBy", params.orderBy)
    if (params?.f_creationDate) queryParams.append("f_creationDate", params.f_creationDate)
    if (params?.f_status) queryParams.append("f_status", params.f_status)

    return vtexRequest({
      endpoint: `/api/oms/pvt/orders?${queryParams.toString()}`,
      method: "GET",
    })
  },

  async getOrder(orderId: string) {
    return vtexRequest({
      endpoint: `/api/oms/pvt/orders/${orderId}`,
      method: "GET",
    })
  },

  async getOrderById(orderId: string) {
    return vtexRequest({
      endpoint: `/api/oms/pvt/orders/${orderId}`,
      method: "GET",
    })
  },

  // Specification APIs
  async addSKUSpecification(skuId: number, fieldId: number, fieldValueId: number) {
    return vtexRequest({
      endpoint: `/api/catalog/pvt/stockkeepingunit/${skuId}/specification`,
      method: "POST",
      body: JSON.stringify({
        FieldId: fieldId,
        FieldValueId: fieldValueId,
      }),
    })
  },
}
