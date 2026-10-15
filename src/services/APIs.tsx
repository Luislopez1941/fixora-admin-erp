import ConfigurationAPIs, { AUTH_TOKEN_KEY } from './configurationAPIs';

export type DeploymentMode = 'CLOUD' | 'LOCAL' | 'HYBRID' | 'OFFLINE';

const APIs = {
  ///////////////////////////////////AUTH////////////////////////////////////////////////////

  login: async (data: { email: string; password: string }) => {
    const res = await ConfigurationAPIs.post<{
      data?: { user: { id: number; email: string; name: string }; token: string };
      status: 'success' | 'warning';
      message: string;
    }>('auth/login', data);

    if (res.data?.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, res.data.token);
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated: () => Boolean(localStorage.getItem(AUTH_TOKEN_KEY)),

  ///////////////////////////////////USERS////////////////////////////////////////////////////

  createUser: <T = any>(data: any) => ConfigurationAPIs.post<T>('users/create', data),
  getUsers: <T = any>() => ConfigurationAPIs.get<T>('platform/users'),
  // clientUserId identifica a qué cliente (base propia) pertenece — el id de
  // usuario por sí solo es ambiguo entre clientes distintos.
  getUserDetail: <T = any>(clientUserId: number | string, userId: number | string) =>
    ConfigurationAPIs.get<T>(`platform/users/${clientUserId}/${userId}`),

  ///////////////////////////////////GIROS////////////////////////////////////////////////////

  getBusinessTypes: <T = any>() => ConfigurationAPIs.get<T>('business-types'),
  getBusinessType: <T = any>(id: number) => ConfigurationAPIs.get<T>(`business-types/${id}`),
  createBusinessType: <T = any>(data: any) => ConfigurationAPIs.post<T>('business-types', data),
  updateBusinessType: <T = any>(id: number, data: any) =>
    ConfigurationAPIs.put<T>(`business-types/${id}`, data),
  deleteBusinessType: <T = any>(id: number) => ConfigurationAPIs.delete<T>(`business-types/${id}`),
  updateBusinessTypeModules: <T = any>(businessTypeId: number, moduleIds: string[]) =>
    ConfigurationAPIs.patch<T>(`business-types/${businessTypeId}/modules`, { moduleIds }),

  ///////////////////////////////////PLATFORM (COMPANIES/STATS)////////////////////////////////////////////////////

  getPlatformStats: <T = any>() => ConfigurationAPIs.get<T>('platform/stats'),
  getCompanies: <T = any>() => ConfigurationAPIs.get<T>('platform/companies'),
  updateCompany: <T = any>(clientUserId: number | string, companyId: number | string, data: any) =>
    ConfigurationAPIs.put<T>(`platform/companies/${clientUserId}/${companyId}`, data),
  deleteCompany: <T = any>(clientUserId: number | string, companyId: number | string) =>
    ConfigurationAPIs.delete<T>(`platform/companies/${clientUserId}/${companyId}`),
  getCompanyDetail: <T = any>(companyId: number | string) =>
    ConfigurationAPIs.get<T>(`platform/companies/${companyId}`),
  getCompanyBilling: <T = any>(companyId: number | string) =>
    ConfigurationAPIs.get<T>(`platform/companies/${companyId}/billing`),
  getCompanyModules: <T = any>(companyId: number | string) =>
    ConfigurationAPIs.get<T>(`platform/companies/${companyId}/modules`),
  updateCompanyModules: <T = any>(
    companyId: number | string,
    payload: { modules: Array<{ moduleId: string; enabled: boolean }> },
  ) => ConfigurationAPIs.put<T>(`platform/companies/${companyId}/modules`, payload),

  ///////////////////////////////////MODULE PRICING (propio del admin, ver licenses/modules-catalog)////////////////////////////////////////////////////

  // Única fuente de verdad ahora es el admin (antes vivía en back-end-fixora-erp
  // vía /platform/modules/pricing) — no depende de que el ERP esté arriba.
  getModulePricing: async <T = any>() => {
    const res = await ConfigurationAPIs.get<{ success: boolean; modules: T }>('licenses/modules-catalog');
    return res.modules;
  },
  updateModulePricing: <T = any>(payload: {
    modules: Array<{ moduleId: string; priceMonthly: number; priceAnnual: number; currency: string }>;
  }) => ConfigurationAPIs.put<T>('licenses/modules-catalog', payload),

  ///////////////////////////////////LICENCIAS (propias de back-end-admin-fixora)////////////////////////////////////////////////////

  getAllLicenses: <T = any>() => ConfigurationAPIs.get<T>('licenses/all'),
  getLicenseModulesCatalog: <T = any>() => ConfigurationAPIs.get<T>('licenses/modules-catalog'),
  createLicense: <T = any>(data: {
    clientUserId?: number;
    companyName?: string;
    branchName?: string;
    deploymentMode?: DeploymentMode;
    erpCompanyId?: number;
    erpInstanceUrl?: string;
    expiresAt?: string;
    modules?: string[];
    maxCompanies?: number | null;
    maxBranches?: number | null;
    maxUsers?: number | null;
  }) => ConfigurationAPIs.post<T>('licenses/create', data),
  updateLicenseModules: <T = any>(licenseKey: string, modules: string[], customChargeAmount?: number) =>
    ConfigurationAPIs.patch<T>(`licenses/${licenseKey}/modules`, { modules, customChargeAmount }),
  updateLicenseLimits: <T = any>(
    licenseKey: string,
    limits: { maxCompanies?: number | null; maxBranches?: number | null; maxUsers?: number | null },
  ) => ConfigurationAPIs.patch<T>(`licenses/${licenseKey}/limits`, limits),
  getLimitPricing: async <T = any>() => {
    const res = await ConfigurationAPIs.get<{ success: boolean; pricing: T }>('licenses/limit-pricing');
    return res.pricing;
  },
  updateLimitPricing: <T = any>(rows: Array<{ kind: string; includedFree: number; priceMonthly: number; priceAnnual: number; currency?: string }>) =>
    ConfigurationAPIs.put<T>('licenses/limit-pricing', { rows }),
  blockLicense: <T = any>(licenseKey: string) =>
    ConfigurationAPIs.post<T>(`licenses/block/${licenseKey}`, {}),
  unblockLicense: <T = any>(licenseKey: string) =>
    ConfigurationAPIs.post<T>(`licenses/unblock/${licenseKey}`, {}),
  deleteLicense: <T = any>(licenseKey: string) =>
    ConfigurationAPIs.delete<T>(`licenses/${licenseKey}`),
  updateLicenseBilling: <T = any>(
    licenseKey: string,
    data: { billingCycle?: string; cycleStartDate?: string | null; discountPercent?: number },
  ) => ConfigurationAPIs.patch<T>(`licenses/${licenseKey}/billing`, data),
  getLicenseCharges: <T = any>(licenseKey: string) => ConfigurationAPIs.get<T>(`licenses/${licenseKey}/charges`),
  addLicenseCharge: <T = any>(licenseKey: string, data: { description: string; amount: number }) =>
    ConfigurationAPIs.post<T>(`licenses/${licenseKey}/charges`, data),
  markChargeAsPaid: <T = any>(licenseKey: string, chargeId: number) =>
    ConfigurationAPIs.patch<T>(`licenses/${licenseKey}/charges/${chargeId}/pay`, {}),
  cancelCharge: <T = any>(licenseKey: string, chargeId: number) =>
    ConfigurationAPIs.patch<T>(`licenses/${licenseKey}/charges/${chargeId}/cancel`, {}),
  updateChargeAmount: <T = any>(licenseKey: string, chargeId: number, amount: number) =>
    ConfigurationAPIs.patch<T>(`licenses/${licenseKey}/charges/${chargeId}/amount`, { amount }),
  deleteCharge: <T = any>(licenseKey: string, chargeId: number) =>
    ConfigurationAPIs.delete<T>(`licenses/${licenseKey}/charges/${chargeId}`),
  downloadOfflineLicense: (licenseKey: string) =>
    ConfigurationAPIs.get<Blob>(`licenses/${licenseKey}/download`, { responseType: 'blob' }),
  getSyncStatus: <T = any>(licenseKey: string) => ConfigurationAPIs.get<T>(`sync/status/${licenseKey}`),

  ///////////////////////////////////MIGRACIONES////////////////////////////////////////////////////

  runMigration: async () => ConfigurationAPIs.post<{ success: boolean; message: string }>('migration/run', {}),
  runMigrationForUser: async (userId: number) => ConfigurationAPIs.post<{ success: boolean; message: string }>(`migration/run/${userId}`, {}),
  deployMigrationForUser: async (userId: number) => ConfigurationAPIs.post<{ success: boolean; message: string; error?: string }>(`migration/deploy/${userId}`, {}),
  pushForceForUser: async (userId: number) => ConfigurationAPIs.post<{ success: boolean; message: string; error?: string }>(`migration/push-force/${userId}`, {}),
  applySqlMigrationForUser: async (userId: number, name: string) => ConfigurationAPIs.post<{ success: boolean; message: string; error?: string }>(`migration/apply-sql/${userId}`, { name }),
  resetDatabase: async (userId: number) => ConfigurationAPIs.post<{ success: boolean; message: string }>(`migration/reset/${userId}`, {}),

  ///////////////////////////////////CLIENT USERS (cuentas de los clientes, separadas de Licencias)////////////////////////////////////////////////////

  getClientUsers: <T = any>() => ConfigurationAPIs.get<T>('client-users'),
  getClientUser: <T = any>(id: number) => ConfigurationAPIs.get<T>(`client-users/${id}`),
  getClientUserOverview: <T = any>(id: number | string) => ConfigurationAPIs.get<T>(`client-users/${id}/overview`),
  createClientUser: <T = any>(data: {
    email: string;
    password: string;
    firstName: string;
    firstLastName: string;
    secondLastName: string;
    phone: string;
    deploymentMode: DeploymentMode;
    businessTypeId?: number;
    databaseUrl?: string;
    directUrl?: string;
    supabaseUrl?: string;
    supabaseAnonKey?: string;
    supabaseServiceRoleKey?: string;
    jwtSecret?: string;
  }) => ConfigurationAPIs.post<T>('client-users', data),
  updateClientUser: <T = any>(id: number, data: {
    email?: string;
    password?: string;
    firstName?: string;
    firstLastName?: string;
    secondLastName?: string;
    phone?: string;
    deploymentMode?: DeploymentMode;
    active?: boolean;
    databaseUrl?: string;
    directUrl?: string;
    supabaseUrl?: string;
    supabaseAnonKey?: string;
    supabaseServiceRoleKey?: string;
    jwtSecret?: string;
  }) => ConfigurationAPIs.patch<T>(`client-users/${id}`, data),
  retryProvisioning: <T = any>(id: number, password: string) =>
    ConfigurationAPIs.post<T>(`client-users/${id}/retry-provisioning`, { password }),
  seedTenantByUserId: <T = any>(userId: number) =>
    ConfigurationAPIs.post<T>(`seed/user/${userId}`, {}),
  syncUser: <T = any>(userId: number, userData: any) =>
    ConfigurationAPIs.post<T>(`seed/sync-user/${userId}`, userData),
};

export default APIs;
