export interface VTEXProduct {
  Id?: number
  Name: string
  DepartmentId: number
  CategoryId: number
  BrandId?: number
  LinkId?: string
  RefId: string
  IsVisible: boolean
  Description: string
  DescriptionShort?: string
  ReleaseDate?: string
  KeyWords?: string
  Title?: string
  IsActive: boolean
  TaxCode?: string
  MetaTagDescription?: string
  ShowWithoutStock?: boolean
}

export interface VTEXSKU {
  Id?: number
  ProductId: number
  IsActive: boolean
  Name: string
  RefId: string
  PackagedHeight: number
  PackagedLength: number
  PackagedWidth: number
  PackagedWeightKg: number
  Height?: number
  Length?: number
  Width?: number
  WeightKg?: number
  CubicWeight: number
  IsKit: boolean
  CreationDate?: string
  RewardValue?: number
  EstimatedDateArrival?: string
  ManufacturerCode?: string
  CommercialConditionId: number
  MeasurementUnit: string
  UnitMultiplier: number
  ModalType?: string
  KitItensSellApart: boolean
  Videos?: string[]
}

export interface VTEXInventory {
  quantity: number
  unlimitedQuantity: boolean
  dateUtcOnBalanceSystem?: string
}

export interface VTEXPrice {
  basePrice: number
  listPrice?: number
  costPrice?: number
  markup?: number
  fixedPrices?: Array<{
    tradePolicyId: string
    value: number
    listPrice?: number
    minQuantity: number
    dateFrom?: string
    dateTo?: string
  }>
}

export interface VTEXOrder {
  orderId: string
  sequence: string
  marketplaceOrderId: string
  marketplaceServicesEndpoint: string
  sellerOrderId: string
  origin: string
  affiliateId: string
  salesChannel: string
  merchantName: string
  status: string
  statusDescription: string
  value: number
  creationDate: string
  lastChange: string
  orderGroup: string
  totals: Array<{
    id: string
    name: string
    value: number
  }>
  items: Array<{
    uniqueId: string
    id: string
    productId: string
    ean: string
    lockId: string
    itemAttachment: any
    attachments: any[]
    quantity: number
    seller: string
    name: string
    refId: string
    price: number
    listPrice: number
    manualPrice: number
    priceTags: any[]
    imageUrl: string
    detailUrl: string
    components: any[]
    bundleItems: any[]
    params: any[]
    offerings: any[]
    sellerSku: string
    priceValidUntil: string
    commission: number
    tax: number
    preSaleDate: string
    additionalInfo: any
    measurementUnit: string
    unitMultiplier: number
    sellingPrice: number
    isGift: boolean
    shippingPrice: number
    rewardValue: number
    freightCommission: number
    priceDefinitions: any
    taxCode: string
    parentItemIndex: number
    parentAssemblyBinding: string
    callCenterOperator: string
    serialNumbers: any[]
    assemblies: any[]
    costPrice: number
  }>
  clientProfileData: {
    email: string
    firstName: string
    lastName: string
    documentType: string
    document: string
    phone: string
    corporateName: string
    tradeName: string
    corporateDocument: string
    stateInscription: string
    corporatePhone: string
    isCorporate: boolean
    userProfileId: string
  }
}

export interface VTEXImage {
  ImageUrl: string
  ImageName: string
  FileId?: number
}

export interface VTEXSpecification {
  FieldId: number
  FieldName: string
  FieldValueIds: number[]
  FieldValues: string[]
}
