export interface PlatformStats {
  companies: number
  users: number
  customers: number
  branches: number
}

export interface CompanyRow {
  id: number
  // A qué cliente (base propia) pertenece esta empresa — cada cliente vive en su
  // propia base, así que el id de empresa por sí solo puede repetirse entre
  // clientes distintos. Úsalo junto con `id` para una key/identidad única.
  clientUserId: number
  ownerEmail: string
  name: string
  businessName: string
  logo: string | null
  taxId: string | null
  createdAt: string
  branchesCount: number
  usersCount: number
  customersCount: number
  salesCount: number
}

export interface UserCompanyRef {
  id: number
  name: string
}

export interface UserRow {
  id: number
  clientUserId: number
  ownerEmail: string
  name: string
  email: string
  userKind: 'SYSTEM' | 'ACCOUNT' | 'STAFF'
  active: boolean
  role: string | null
  createdAt: string
  companies: UserCompanyRef[]
}

export interface CompanyModule {
  moduleId: string
  name: string
  description?: string
  version?: string
  enabled: boolean
}

export interface CompanyModulesResponse {
  company: {
    id: number
    name: string
    businessName: string
  }
  modules: CompanyModule[]
}

export interface UpdateCompanyModulesPayload {
  modules: Array<{ moduleId: string; enabled: boolean }>
}

export interface ModulePricingRow {
  moduleId: string
  name: string
  description?: string
  priceMonthly: number
  priceAnnual: number
  currency: string
  updatedAt: string | null
}

export interface CompanyBillingLine {
  moduleId: string
  name: string
  enabled: boolean
  priceMonthly: number
  priceAnnual: number
  currency: string
  monthlyTotal: number
  annualTotal: number
}

export interface CompanyBilling {
  company: { id: number; name: string; businessName: string }
  lines: CompanyBillingLine[]
  totalMonthly: number
  totalAnnual: number
  currency: string
}

export interface CompanyDetail {
  id: number
  name: string
  businessName: string
  taxId: string | null
  createdAt: string
  salesCount: number
  customersCount: number
  usersCount: number
  branches: Array<{ id: number; name: string; address: string | null; createdAt: string }>
  modules: Array<{ moduleId: string; name: string; description?: string; enabled: boolean }>
}

export interface UserCompanyDetail {
  id: number
  name: string
  businessName: string
  taxId: string | null
  createdAt: string
  salesCount: number
  customersCount: number
  branches: Array<{ id: number; name: string; address: string | null }>
  modules: Array<{ moduleId: string; name: string; enabled: boolean }>
}

export interface UserDetail {
  id: number
  clientUserId: number
  name: string
  email: string
  userKind: 'SYSTEM' | 'ACCOUNT' | 'STAFF'
  active: boolean
  role: string | null
  createdAt: string
  companies: UserCompanyDetail[]
}
