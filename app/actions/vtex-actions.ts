"use server"

import { vtexAPI } from "@/lib/client"

export async function createProductAction(formData: FormData) {
  try {
    const productData = {
      Name: formData.get("name") as string,
      DepartmentId: Number.parseInt(formData.get("departmentId") as string),
      CategoryId: Number.parseInt(formData.get("categoryId") as string),
      BrandId: Number.parseInt(formData.get("brandId") as string) || 1,
      RefId: formData.get("refId") as string,
      IsVisible: true,
      Description: formData.get("description") as string,
      IsActive: true,
      ShowWithoutStock: true,
    }

    const product = await vtexAPI.createProduct(productData)
    return { success: true, data: product }
  } catch (error) {
    console.error("Error creating product:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function createSKUAction(formData: FormData) {
  try {
    const skuData = {
      ProductId: Number.parseInt(formData.get("productId") as string),
      IsActive: true,
      Name: formData.get("name") as string,
      RefId: formData.get("refId") as string,
      PackagedHeight: 10,
      PackagedLength: 10,
      PackagedWidth: 10,
      PackagedWeightKg: 0.5,
      CubicWeight: 0.5,
      IsKit: false,
      CommercialConditionId: 1,
      MeasurementUnit: "un",
      UnitMultiplier: 1,
      KitItensSellApart: false,
    }

    const sku = await vtexAPI.createSKU(skuData)
    return { success: true, data: sku }
  } catch (error) {
    console.error("Error creating SKU:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function addSKUImageAction(skuId: number, imageUrl: string, imageName: string) {
  try {
    const result = await vtexAPI.addSKUImage(skuId, {
      ImageUrl: imageUrl,
      ImageName: imageName,
    })
    return { success: true, data: result }
  } catch (error) {
    console.error("Error adding SKU image:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateInventoryAction(skuId: number, warehouseId: string, quantity: number) {
  try {
    const inventoryData = {
      quantity,
      unlimitedQuantity: false,
    }

    const result = await vtexAPI.updateInventory(skuId, warehouseId, inventoryData)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error updating inventory:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updatePriceAction(skuId: number, basePrice: number, listPrice?: number) {
  try {
    const priceData = {
      basePrice,
      listPrice: listPrice || basePrice,
      costPrice: basePrice * 0.7,
      markup: 30,
    }

    const result = await vtexAPI.updatePrice(skuId, priceData)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error updating price:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function listOrdersAction(page = 1, perPage = 15) {
  try {
    const result = await vtexAPI.listOrders({ page, perPage, orderBy: "creationDate,desc" })
    return { success: true, data: result }
  } catch (error) {
    console.error("Error listing orders:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getOrderAction(orderId: string) {
  try {
    const result = await vtexAPI.getOrder(orderId)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error getting order:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function addSKUSpecificationAction(skuId: number, fieldId: number, fieldValueId: number) {
  try {
    const result = await vtexAPI.addSKUSpecification(skuId, fieldId, fieldValueId)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error adding SKU specification:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getProductAndSkuIdsAction(page = 1, pageSize = 50) {
  try {
    const result = await vtexAPI.getProductAndSkuIds(page, pageSize)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error getting product and SKU IDs:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getProductByIdAction(productId: string) {
  try {
    const result = await vtexAPI.getProductById(productId)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error getting product by ID:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getOrderByIdAction(orderId: string) {
  try {
    const result = await vtexAPI.getOrderById(orderId)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error getting order by ID:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
