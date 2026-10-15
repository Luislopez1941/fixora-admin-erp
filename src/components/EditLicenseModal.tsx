import { useEffect, useState } from 'react'
import { Calendar } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import APIs from '../services/APIs'
import { useFetch } from '../lib/useFetch'

interface ModuleCatalogItem {
  moduleId: string
  name: string
  priceMonthly: number
  priceAnnual: number
  currency: string
}

interface LimitPricingRow {
  kind: string
  includedFree: number
  priceMonthly: number
  priceAnnual: number
  currency: string
}

interface Charge {
  id: number
  description: string
  moduleIds: string[]
  baseAmount: number
  discountPercent: number
  discountAmount: number
  amount: number
  currency: string
  periodStart: string | null
  periodEnd: string | null
  status: 'pending' | 'paid' | 'cancelled'
  paidAt: string | null
  createdAt: string
}

export interface EditableLicense {
  key: string
  modules: string[]
  maxCompanies: number | null
  maxBranches: number | null
  maxUsers: number | null
  billingCycle: string
  cycleStartDate: string | null
  discountPercent: number
  // Datos informativos de a quién pertenece la licencia (solo lectura).
  status?: string
  deploymentMode?: string
  companyName?: string | null
  branchName?: string | null
  clientUser?: {
    id: number
    email: string
    firstName: string
    firstLastName: string
    secondLastName: string
  } | null
  erpUserId?: number | null
  erpInstanceUrl?: string | null
  activatedAt?: string | null
  expiresAt?: string | null
  createdAt?: string
}

interface Props {
  license: EditableLicense | null
  onClose: () => void
  onSaved: () => void
}

const fmtMoney = (n: number, currency = 'MXN') => new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(n)
const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : '—')

// Misma lógica que back-end-admin-fixora (LicensesService.getCurrentCyclePeriod)
// — se usa para MOSTRAR el próximo corte y una vista previa del prorrateo antes
// de guardar; el cálculo que de verdad se cobra siempre lo hace el backend al
// guardar (ver updateLicenseModules → createModuleAdditionCharge).
function getCurrentCyclePeriod(cycleStartDate: string, billingCycle: string, now = new Date()) {
  const addPeriod = (d: Date) => {
    const next = new Date(d)
    if (billingCycle === 'monthly') next.setMonth(next.getMonth() + 1)
    else next.setFullYear(next.getFullYear() + 1)
    return next
  }
  let start = new Date(cycleStartDate)
  let end = addPeriod(start)
  while (end <= now) {
    start = end
    end = addPeriod(start)
  }
  return { start, end }
}

function nextCutoff(cycleStartDate: string, billingCycle: string): Date {
  return getCurrentCyclePeriod(cycleStartDate, billingCycle).end
}

function useLimitField(current: number | null) {
  const [value, setValue] = useState(current != null ? String(current) : '')
  const [unlimited, setUnlimited] = useState(current == null)
  useEffect(() => {
    setValue(current != null ? String(current) : '')
    setUnlimited(current == null)
  }, [current])
  return { value, setValue, unlimited, setUnlimited }
}

// Un solo modal para ver/editar todo de una licencia ya creada — antes eran 3
// botones e íconos separados (módulos, límites, facturación), cada uno con su
// propio modal chiquito. Se consolidan aquí como pestañas de UN modal — mismo
// patrón de pestañas que NewLicenseModal, pero cada pestaña guarda por su cuenta
// (son 3 endpoints PATCH independientes, no tiene sentido forzar un solo botón
// "Guardar" para los tres).
export default function EditLicenseModal({ license, onClose, onSaved }: Props) {
  const [activeTab, setActiveTab] = useState<'modulos' | 'limites' | 'facturacion'>('modulos')

  // ── Módulos ──────────────────────────────────────────────────────────────
  const [selectedModules, setSelectedModules] = useState<string[]>(license?.modules ?? [])
  // Qué módulos están REALMENTE guardados ahora mismo — separado de la prop
  // `license.modules`, que no se actualiza sola dentro de esta misma sesión del
  // modal. Sin esto, guardar módulos nuevos y luego agregar otro más seguía
  // comparando contra la lista de ANTES del primer guardado.
  const [savedModules, setSavedModules] = useState<string[]>(license?.modules ?? [])
  const [modulesBillingCycle, setModulesBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [savingModules, setSavingModules] = useState(false)
  const [modulesError, setModulesError] = useState<string | null>(null)
  // Si lo marcan, el cobro por los módulos nuevos usa este monto en vez del
  // prorrateo/descuento automático — para cortesías, precios negociados, etc.
  const [useCustomPrice, setUseCustomPrice] = useState(false)
  const [customPrice, setCustomPrice] = useState('')

  const { data: modulesResponse } = useFetch<{ modules: ModuleCatalogItem[] }>(() =>
    APIs.getLicenseModulesCatalog<{ modules: ModuleCatalogItem[] }>(),
  )

  // ── Límites ──────────────────────────────────────────────────────────────
  const companies = useLimitField(license?.maxCompanies ?? null)
  const branches = useLimitField(license?.maxBranches ?? null)
  const users = useLimitField(license?.maxUsers ?? null)
  const [savingLimits, setSavingLimits] = useState(false)
  const [limitsError, setLimitsError] = useState<string | null>(null)
  // Qué límites están REALMENTE guardados ahora mismo — mismo motivo que
  // savedModules: sin esto, la vista previa de "cuánto se va a cobrar" seguía
  // comparando contra los límites de ANTES del primer guardado en esta sesión.
  const [savedLimits, setSavedLimits] = useState({
    maxCompanies: license?.maxCompanies ?? null,
    maxBranches: license?.maxBranches ?? null,
    maxUsers: license?.maxUsers ?? null,
  })

  const { data: limitPricingResponse } = useFetch<LimitPricingRow[]>(() =>
    APIs.getLimitPricing<LimitPricingRow[]>(),
  )

  // ── Facturación ──────────────────────────────────────────────────────────
  const [billingCycle, setBillingCycle] = useState(license?.billingCycle || 'annual')
  // Si la licencia todavía no tiene ciclo configurado, se asume que arrancó HOY
  // — así el prorrateo funciona desde ya sin que alguien tenga que acordarse de
  // ir a configurarlo primero. Editable: si lo cambian, eso es lo que se guarda.
  const [cycleStartDate, setCycleStartDate] = useState<Date>(
    license?.cycleStartDate ? new Date(license.cycleStartDate) : new Date(),
  )
  const [discountPercent, setDiscountPercent] = useState(String(license?.discountPercent ?? 0))
  const [showCalendar, setShowCalendar] = useState(false)
  const [savingBilling, setSavingBilling] = useState(false)
  const [billingError, setBillingError] = useState<string | null>(null)

  const [newDescription, setNewDescription] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [chargeError, setChargeError] = useState<string | null>(null)
  const [payingId, setPayingId] = useState<number | null>(null)
  // Checkbox por cobro pendiente que desbloquea editar su monto (la "deuda" que
  // le va a aparecer pagar al cliente) — antes de que lo paguen puede que se
  // haya calculado mal el prorrateo o se haya negociado otro precio.
  const [editingChargeId, setEditingChargeId] = useState<number | null>(null)
  const [editAmount, setEditAmount] = useState('')
  // "Agregar cobro" ya no guarda al toque — se junta aquí y se manda al backend
  // hasta que le den "Guardar configuración", igual que el resto de esta pestaña.
  const [pendingCharges, setPendingCharges] = useState<Array<{ description: string; amount: number }>>([])

  const {
    data: chargesResponse,
    refetch: refetchCharges,
  } = useFetch<{ success: boolean; charges: Charge[] }>(
    () => (license ? APIs.getLicenseCharges<{ success: boolean; charges: Charge[] }>(license.key) : Promise.resolve({ success: true, charges: [] })),
    [license?.key],
  )
  const charges = chargesResponse?.charges ?? []

  useEffect(() => {
    setSelectedModules(license?.modules ?? [])
    setSavedModules(license?.modules ?? [])
    companies.setValue(license?.maxCompanies != null ? String(license.maxCompanies) : '')
    companies.setUnlimited(license?.maxCompanies == null)
    branches.setValue(license?.maxBranches != null ? String(license.maxBranches) : '')
    branches.setUnlimited(license?.maxBranches == null)
    users.setValue(license?.maxUsers != null ? String(license.maxUsers) : '')
    users.setUnlimited(license?.maxUsers == null)
    setSavedLimits({
      maxCompanies: license?.maxCompanies ?? null,
      maxBranches: license?.maxBranches ?? null,
      maxUsers: license?.maxUsers ?? null,
    })
    setBillingCycle(license?.billingCycle || 'annual')
    setDiscountPercent(String(license?.discountPercent ?? 0))
    setActiveTab('modulos')
    setPendingCharges([])
    setNewDescription('')
    setNewAmount('')
    setUseCustomPrice(false)
    setCustomPrice('')
    setEditingChargeId(null)
    setEditAmount('')

    if (license?.cycleStartDate) {
      setCycleStartDate(new Date(license.cycleStartDate))
    } else if (license) {
      // Sin ciclo configurado todavía: se asume hoy Y se guarda de una vez en
      // silencio — así el prorrateo ya funciona sin que nadie tenga que entrar
      // a Facturación a configurarlo primero. Sigue siendo editable después.
      const today = new Date()
      setCycleStartDate(today)
      APIs.updateLicenseBilling(license.key, { cycleStartDate: today.toISOString() }).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [license?.key])

  if (!license) return null

  // ── Módulos: agrupar + total ─────────────────────────────────────────────
  const moduleGroups = (() => {
    const all = modulesResponse?.modules ?? []
    const parents = all.filter((m) => !m.moduleId.includes('.'))
    return parents.map((parent) => ({
      parent,
      children: all.filter((m) => m.moduleId !== parent.moduleId && m.moduleId.startsWith(`${parent.moduleId}.`)),
    }))
  })()

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) => (prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]))
  }

  const toggleGroup = (parentId: string, children: ModuleCatalogItem[]) => {
    const groupIds = [parentId, ...children.map((c) => c.moduleId)]
    const allSelected = groupIds.every((id) => selectedModules.includes(id))
    setSelectedModules((prev) =>
      allSelected ? prev.filter((id) => !groupIds.includes(id)) : [...new Set([...prev, ...groupIds])],
    )
  }

  const allModules = modulesResponse?.modules ?? []
  const modulesCurrency = allModules[0]?.currency ?? 'MXN'
  const totalModulesPrice = selectedModules.reduce((sum, id) => {
    const mod = allModules.find((m) => m.moduleId === id)
    if (!mod) return sum
    return sum + (modulesBillingCycle === 'monthly' ? mod.priceMonthly : mod.priceAnnual)
  }, 0)

  // Vista previa de lo que va a costar AHORA agregar justo los módulos nuevos
  // (los que todavía no estaban guardados en la licencia) — mismo cálculo de
  // prorrateo que hace el backend al guardar, para que se vea de inmediato sin
  // tener que guardar primero y revisar la pestaña de Facturación.
  const addedModuleIds = selectedModules.filter((id) => !savedModules.includes(id))
  const addedModulesPriced = addedModuleIds
    .map((id) => allModules.find((m) => m.moduleId === id))
    .filter((m): m is NonNullable<typeof m> => !!m)
  const addedFullPrice = addedModulesPriced.reduce(
    (sum, m) => sum + (license.billingCycle === 'monthly' ? m.priceMonthly : m.priceAnnual),
    0,
  )

  const customPriceValue = Number(customPrice)
  // >= 0, no solo > 0 — un 0 es válido (cortesía/módulo gratis, pero que quede
  // registrado como cobro en el historial, no que simplemente no se genere nada).
  const hasValidCustomPrice = useCustomPrice && customPrice !== '' && !Number.isNaN(customPriceValue) && customPriceValue >= 0

  let additionPreview: { fraction: number; baseAmount: number; discountAmount: number; amount: number; cutoff: Date; isCustom: boolean } | null = null
  if (hasValidCustomPrice) {
    // Precio personalizado: se salta el prorrateo/descuento por completo, el
    // monto que escriben es exactamente lo que se cobra.
    const { end } = getCurrentCyclePeriod(cycleStartDate.toISOString(), license.billingCycle)
    additionPreview = { fraction: 1, baseAmount: customPriceValue, discountAmount: 0, amount: customPriceValue, cutoff: end, isCustom: true }
  } else if (addedFullPrice > 0) {
    // Usa el estado LOCAL (cycleStartDate), no el prop license.cycleStartDate —
    // ese se queda viejo dentro de esta misma sesión del modal (ver el
    // auto-guardado silencioso de arriba cuando no había ciclo configurado).
    const { start, end } = getCurrentCyclePeriod(cycleStartDate.toISOString(), license.billingCycle)
    const now = new Date()
    const totalMs = end.getTime() - start.getTime()
    const remainingMs = Math.max(0, end.getTime() - now.getTime())
    const fraction = totalMs > 0 ? Math.min(1, remainingMs / totalMs) : 0
    const baseAmount = Math.round(addedFullPrice * fraction * 100) / 100
    const discountAmount = Math.round(baseAmount * (license.discountPercent / 100) * 100) / 100
    const amount = Math.round((baseAmount - discountAmount) * 100) / 100
    additionPreview = { fraction, baseAmount, discountAmount, amount, cutoff: end, isCustom: false }
  }

  const handleSaveModules = async () => {
    if (useCustomPrice && !hasValidCustomPrice) {
      setModulesError('Indica un precio personalizado válido (0 o más), o desmarca la casilla.')
      return
    }
    setSavingModules(true)
    setModulesError(null)
    try {
      await APIs.updateLicenseModules(license.key, selectedModules, hasValidCustomPrice ? customPriceValue : undefined)
      // El guardado puede haber creado un cobro nuevo (módulos agregados) — sin
      // esto, si el admin se queda en el mismo modal y cambia a "Facturación",
      // seguía viendo el historial de ANTES de guardar (el fetch de cobros solo
      // se dispara al abrir el modal, no se enteraba de este cambio).
      refetchCharges()
      // Y sin esto, la vista previa de "módulos nuevos" seguía comparando contra
      // la lista de ANTES de este guardado (ver nota en savedModules arriba).
      setSavedModules(selectedModules)
      setUseCustomPrice(false)
      setCustomPrice('')
      onSaved()
    } catch (err: any) {
      setModulesError(err.message || 'No se pudieron guardar los módulos.')
    } finally {
      setSavingModules(false)
    }
  }

  // ── Límites ──────────────────────────────────────────────────────────────
  const limitFields = [
    { label: 'Empresas', kind: 'companies', ...companies },
    { label: 'Sucursales', kind: 'branches', ...branches },
    { label: 'Usuarios', kind: 'users', ...users },
  ]

  // Vista previa de cuánto se va a cobrar por subir un límite, ANTES de guardar
  // — mismo prorrateo que la vista previa de módulos nuevos, pero usando el
  // catálogo de precio-por-unidad-extra (LimitPricing) en vez del de módulos.
  // Bajar un límite o pasarlo a ilimitado nunca genera cobro aquí (ver nota en
  // el backend, createLimitIncreaseCharges).
  const limitPricing = limitPricingResponse ?? []
  const limitsCurrency = limitPricing[0]?.currency ?? 'MXN'
  const limitPreviewItems = (() => {
    if (!limitPricing.length) return []
    const { start, end } = getCurrentCyclePeriod(cycleStartDate.toISOString(), license.billingCycle)
    const now = new Date()
    const totalMs = end.getTime() - start.getTime()
    const remainingMs = Math.max(0, end.getTime() - now.getTime())
    const fraction = totalMs > 0 ? Math.min(1, remainingMs / totalMs) : 0

    const items: Array<{ kind: string; label: string; extraUnits: number; fraction: number; discountAmount: number; amount: number; cutoff: Date }> = []
    for (const f of limitFields) {
      const before = (savedLimits as any)[`max${f.kind === 'companies' ? 'Companies' : f.kind === 'branches' ? 'Branches' : 'Users'}`] as number | null
      const after = f.unlimited ? null : (f.value ? Number(f.value) : null)
      if (before == null || after == null || after <= before) continue
      const pricing = limitPricing.find((p) => p.kind === f.kind)
      if (!pricing) continue
      const pricePerUnit = license.billingCycle === 'monthly' ? pricing.priceMonthly : pricing.priceAnnual
      if (pricePerUnit <= 0) continue
      const extraUnits = after - before
      const fullPrice = extraUnits * pricePerUnit
      const baseAmount = Math.round(fullPrice * fraction * 100) / 100
      const discountAmount = Math.round(baseAmount * (license.discountPercent / 100) * 100) / 100
      const amount = Math.round((baseAmount - discountAmount) * 100) / 100
      items.push({ kind: f.kind, label: f.label, extraUnits, fraction, discountAmount, amount, cutoff: end })
    }
    return items
  })()
  const limitPreviewTotal = limitPreviewItems.reduce((s, i) => s + i.amount, 0)

  const handleSaveLimits = async () => {
    setLimitsError(null)
    for (const f of limitFields) {
      if (!f.unlimited && (!f.value || Number(f.value) < 1)) {
        setLimitsError(`Indica un número válido de ${f.label.toLowerCase()}, o márcalo como ilimitado.`)
        return
      }
    }
    setSavingLimits(true)
    try {
      const newLimits = {
        maxCompanies: companies.unlimited ? null : Number(companies.value),
        maxBranches: branches.unlimited ? null : Number(branches.value),
        maxUsers: users.unlimited ? null : Number(users.value),
      }
      await APIs.updateLicenseLimits(license.key, newLimits)
      setSavedLimits(newLimits)
      refetchCharges()
      onSaved()
    } catch (err: any) {
      setLimitsError(err.message || 'No se pudieron guardar los límites.')
    } finally {
      setSavingLimits(false)
    }
  }

  // ── Facturación ──────────────────────────────────────────────────────────
  const totalPending = charges.filter((c) => c.status === 'pending').reduce((s, c) => s + c.amount, 0)
  const chargesCurrency = charges[0]?.currency ?? 'MXN'

  const handleSaveBilling = async () => {
    setBillingError(null)
    const pct = Number(discountPercent)
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      setBillingError('El descuento debe ser un número entre 0 y 100.')
      return
    }
    setSavingBilling(true)
    try {
      await APIs.updateLicenseBilling(license.key, {
        billingCycle,
        cycleStartDate: cycleStartDate.toISOString(),
        discountPercent: pct,
      })
      // Los cobros manuales que se fueron juntando con "Agregar cobro" se mandan
      // justo aquí, junto con el resto — uno por uno, no hay endpoint de batch.
      for (const pending of pendingCharges) {
        await APIs.addLicenseCharge(license.key, pending)
      }
      if (pendingCharges.length) {
        setPendingCharges([])
        refetchCharges()
      }
      onSaved()
    } catch (err: any) {
      setBillingError(err.message || 'No se pudo guardar la configuración.')
    } finally {
      setSavingBilling(false)
    }
  }

  // Ya NO llama al backend — solo junta el cobro en la lista local. Se manda de
  // verdad hasta que le den "Guardar configuración" (ver handleSaveBilling).
  const handleAddCharge = () => {
    setChargeError(null)
    const amount = Number(newAmount)
    if (!newDescription.trim()) {
      setChargeError('Falta la descripción del cobro.')
      return
    }
    if (!amount || amount <= 0) {
      setChargeError('El monto debe ser mayor a 0.')
      return
    }
    setPendingCharges((prev) => [...prev, { description: newDescription.trim(), amount }])
    setNewDescription('')
    setNewAmount('')
  }

  const removePendingCharge = (index: number) => {
    setPendingCharges((prev) => prev.filter((_, i) => i !== index))
  }

  const handleMarkPaid = async (chargeId: number) => {
    setPayingId(chargeId)
    try {
      await APIs.markChargeAsPaid(license.key, chargeId)
      refetchCharges()
    } finally {
      setPayingId(null)
    }
  }

  const handleCancelCharge = async (chargeId: number) => {
    setPayingId(chargeId)
    try {
      await APIs.cancelCharge(license.key, chargeId)
      refetchCharges()
    } catch (err: any) {
      setChargeError(err.message || 'No se pudo cancelar el cobro.')
    } finally {
      setPayingId(null)
    }
  }

  const handleSaveChargeAmount = async (chargeId: number) => {
    setChargeError(null)
    const amount = Number(editAmount)
    if (editAmount === '' || Number.isNaN(amount) || amount < 0) {
      setChargeError('Indica un monto válido (0 o más).')
      return
    }
    setPayingId(chargeId)
    try {
      await APIs.updateChargeAmount(license.key, chargeId, amount)
      setEditingChargeId(null)
      refetchCharges()
    } catch (err: any) {
      setChargeError(err.message || 'No se pudo modificar el monto.')
    } finally {
      setPayingId(null)
    }
  }

  const handleDeleteCharge = async (chargeId: number) => {
    if (!window.confirm('¿Eliminar este cobro permanentemente? No se puede deshacer.')) return
    setPayingId(chargeId)
    try {
      await APIs.deleteCharge(license.key, chargeId)
      refetchCharges()
    } catch (err: any) {
      setChargeError(err.message || 'No se pudo eliminar el cobro.')
    } finally {
      setPayingId(null)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>
          <span className="msr">close</span>
        </button>

        <div className="license-owner">
          <div className="license-owner__title">
            <span className="msr">badge</span>
            <span>Licencia {license?.key}</span>
            {license?.status && <span className={`badge badge--${license.status}`}>{{ active: 'Activa', blocked: 'Bloqueada', expired: 'Expirada' }[license.status] ?? license.status}</span>}
          </div>
          <div className="license-owner__grid">
            <div>
              <small>Usuario / dueño</small>
              <strong>{license?.clientUser ? [license.clientUser.firstName, license.clientUser.firstLastName, license.clientUser.secondLastName].filter(Boolean).join(' ') : 'Sin usuario asignado'}</strong>
              <span>{license?.clientUser?.email ?? '—'}</span>
            </div>
            <div>
              <small>Empresa</small>
              <strong>{license?.companyName ?? '—'}</strong>
              <span>Sucursal: {license?.branchName ?? '—'}</span>
            </div>
            <div>
              <small>Modo</small>
              <strong>{license?.deploymentMode ? ({ CLOUD: 'Nube', LOCAL: 'Local', HYBRID: 'Híbrido', OFFLINE: 'Offline' } as Record<string, string>)[license.deploymentMode] ?? license.deploymentMode : '—'}</strong>
              <span>{license?.erpUserId ? `Usuario ERP #${license.erpUserId}` : 'Sin usuario ERP vinculado'}</span>
            </div>
            <div>
              <small>Vigencia</small>
              <strong>{license?.expiresAt ? `Vence ${fmtDate(license.expiresAt)}` : 'Sin vencimiento'}</strong>
              <span>Creada {fmtDate(license?.createdAt ?? null)}</span>
            </div>
          </div>
        </div>

        <div className="modal-tabs">
          <button
            type="button"
            className={`modal-tabs__item ${activeTab === 'modulos' ? 'modal-tabs__item--active' : ''}`}
            onClick={() => setActiveTab('modulos')}
          >
            <span className="msr" style={{ fontSize: 16 }}>apps</span>
            Módulos
            {selectedModules.length > 0 && <span className="modal-tabs__badge">{selectedModules.length}</span>}
          </button>
          <button
            type="button"
            className={`modal-tabs__item ${activeTab === 'limites' ? 'modal-tabs__item--active' : ''}`}
            onClick={() => setActiveTab('limites')}
          >
            <span className="msr" style={{ fontSize: 16 }}>tune</span>
            Límites
          </button>
          <button
            type="button"
            className={`modal-tabs__item ${activeTab === 'facturacion' ? 'modal-tabs__item--active' : ''}`}
            onClick={() => setActiveTab('facturacion')}
          >
            <span className="msr" style={{ fontSize: 16 }}>payments</span>
            Facturación
            {totalPending > 0 && <span className="modal-tabs__badge">{fmtMoney(totalPending, chargesCurrency)}</span>}
          </button>
        </div>

        <div className="modal__body">
          {/* ── Pestaña Módulos ── */}
          <div className="modal-section" style={{ display: activeTab === 'modulos' ? undefined : 'none' }}>
            <div className="license-modules__head">
              <small className="modal-hint" style={{ marginTop: 0 }}>
                Se aplican la próxima vez que el cliente active o entre a su cuenta.
              </small>
              <div className="billing-toggle">
                <button
                  type="button"
                  className={modulesBillingCycle === 'monthly' ? 'billing-toggle__item billing-toggle__item--active' : 'billing-toggle__item'}
                  onClick={() => setModulesBillingCycle('monthly')}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  className={modulesBillingCycle === 'annual' ? 'billing-toggle__item billing-toggle__item--active' : 'billing-toggle__item'}
                  onClick={() => setModulesBillingCycle('annual')}
                >
                  Anual
                </button>
              </div>
            </div>

            <div className="license-total">
              <span className="license-total__label">
                Total {modulesBillingCycle === 'monthly' ? 'mensual' : 'anual'} ({selectedModules.length} módulo{selectedModules.length === 1 ? '' : 's'})
              </span>
              <span className="license-total__value">{fmtMoney(totalModulesPrice, modulesCurrency)}</span>
            </div>

            {addedModuleIds.length > 0 && (
              additionPreview ? (
                <div className="license-total license-total--preview">
                  <span className="license-total__label">
                    Se cobrará por {addedModuleIds.length} módulo{addedModuleIds.length === 1 ? '' : 's'} nuevo{addedModuleIds.length === 1 ? '' : 's'} al guardar
                    <br />
                    <small>
                      {additionPreview.isCustom ? (
                        'Precio personalizado — sin prorrateo ni descuento automático'
                      ) : (
                        <>
                          Prorrateado {Math.round(additionPreview.fraction * 100)}% hasta el corte ({fmtDate(additionPreview.cutoff.toISOString())})
                          {additionPreview.discountAmount > 0 && ` · ${license.discountPercent}% dto. (−${fmtMoney(additionPreview.discountAmount, modulesCurrency)})`}
                        </>
                      )}
                    </small>
                  </span>
                  <span className="license-total__value">{fmtMoney(additionPreview.amount, modulesCurrency)}</span>
                </div>
              ) : (
                <small className="modal-hint" style={{ marginTop: 0 }}>
                  Agregaste {addedModuleIds.length} módulo{addedModuleIds.length === 1 ? '' : 's'} nuevo{addedModuleIds.length === 1 ? '' : 's'} sin costo.
                </small>
              )
            )}

            {addedModuleIds.length > 0 && addedFullPrice > 0 && (
              <div className="custom-price-row">
                <label className="custom-price-row__check">
                  <input
                    type="checkbox"
                    className="ui-checkbox"
                    checked={useCustomPrice}
                    onChange={(e) => setUseCustomPrice(e.target.checked)}
                  />
                  Precio personalizado para este cobro
                </label>
                {useCustomPrice && (
                  <div className="custom-price-row__input">
                    <span>$</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Monto a cobrar (puede ser 0)"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="license-modules">
              {moduleGroups.map(({ parent, children }) => {
                const groupIds = [parent.moduleId, ...children.map((c) => c.moduleId)]
                const allSelected = groupIds.every((id) => selectedModules.includes(id))
                const someSelected = !allSelected && groupIds.some((id) => selectedModules.includes(id))
                return (
                  <div className="license-modules__group" key={parent.moduleId}>
                    <label className="license-modules__parent">
                      <input
                        type="checkbox"
                        className="ui-checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected }}
                        onChange={() => toggleGroup(parent.moduleId, children)}
                      />
                      {parent.name}
                    </label>
                    {children.length > 0 && (
                      <div className="license-modules__children">
                        {children.map((child) => (
                          <label className="license-modules__child" key={child.moduleId}>
                            <input
                              type="checkbox"
                              className="ui-checkbox"
                              checked={selectedModules.includes(child.moduleId)}
                              onChange={() => toggleModule(child.moduleId)}
                            />
                            {child.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {modulesError && (
              <div className="modal-error">
                <span className="msr" style={{ fontSize: 16 }}>error</span>
                {modulesError}
              </div>
            )}
          </div>

          {/* ── Pestaña Límites ── */}
          <div className="modal-section" style={{ display: activeTab === 'limites' ? undefined : 'none' }}>
            <small className="modal-hint" style={{ marginTop: 0 }}>
              Cuántas empresas, sucursales y usuarios puede crear este cliente.
            </small>

            <div className="license-limits">
              {limitFields.map((f) => (
                <div className="license-limits__row" key={f.label}>
                  <span className="license-limits__label">{f.label}</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="Cantidad"
                    value={f.value}
                    disabled={f.unlimited}
                    onChange={(e) => f.setValue(e.target.value)}
                  />
                  <label className="license-limits__unlimited">
                    <input type="checkbox" className="ui-checkbox" checked={f.unlimited} onChange={(e) => f.setUnlimited(e.target.checked)} />
                    Ilimitado
                  </label>
                </div>
              ))}
            </div>

            {limitPreviewItems.length > 0 && (
              <div className="license-total license-total--preview" style={{ marginTop: 14 }}>
                <span className="license-total__label">
                  Se cobrará al guardar los límites
                  <br />
                  <small>
                    {limitPreviewItems.map((i) => `+${i.extraUnits} ${i.label.toLowerCase()}`).join(' · ')}
                    {' · '}Prorrateado {Math.round(limitPreviewItems[0].fraction * 100)}% hasta el corte ({fmtDate(limitPreviewItems[0].cutoff.toISOString())})
                    {license.discountPercent > 0 && ` · ${license.discountPercent}% dto.`}
                  </small>
                </span>
                <span className="license-total__value">{fmtMoney(limitPreviewTotal, limitsCurrency)}</span>
              </div>
            )}

            {limitsError && (
              <div className="modal-error">
                <span className="msr" style={{ fontSize: 16 }}>error</span>
                {limitsError}
              </div>
            )}
          </div>

          {/* ── Pestaña Facturación ── */}
          <div className="modal-section" style={{ display: activeTab === 'facturacion' ? undefined : 'none' }}>
            <div className="billing-settings">
              <div className="billing-settings__row">
                <div>
                  <label>Ciclo</label>
                  <div className="billing-toggle">
                    <button
                      type="button"
                      className={billingCycle === 'monthly' ? 'billing-toggle__item billing-toggle__item--active' : 'billing-toggle__item'}
                      onClick={() => setBillingCycle('monthly')}
                    >
                      Mensual
                    </button>
                    <button
                      type="button"
                      className={billingCycle === 'annual' ? 'billing-toggle__item billing-toggle__item--active' : 'billing-toggle__item'}
                      onClick={() => setBillingCycle('annual')}
                    >
                      Anual
                    </button>
                  </div>
                </div>

                <div className="billing-settings__date-field">
                  <label>Inicio del ciclo actual</label>
                  <button type="button" className="date-field__trigger" onClick={() => setShowCalendar((s) => !s)}>
                    <span className="msr" style={{ fontSize: 16 }}>event</span>
                    {fmtDate(cycleStartDate.toISOString())}
                  </button>
                  {showCalendar && (
                    <div className="date-field__popover">
                      <Calendar
                        date={cycleStartDate}
                        onChange={(d) => {
                          setCycleStartDate(d)
                          setShowCalendar(false)
                        }}
                        maxDate={new Date()}
                        color="#6d28d9"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label>Descuento (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="billing-settings__discount-input"
                  />
                </div>
              </div>

              <small className="modal-hint">
                Próximo corte: {fmtDate(nextCutoff(cycleStartDate.toISOString(), billingCycle).toISOString())} — un módulo nuevo que agregues antes de esa fecha se cobra prorrateado hasta entonces.
              </small>

              {billingError && (
                <div className="modal-error">
                  <span className="msr" style={{ fontSize: 16 }}>error</span>
                  {billingError}
                </div>
              )}
            </div>

            {addedModuleIds.length > 0 && (
              <>
                <h4 className="modal-section__title" style={{ marginTop: 22 }}>
                  <span className="msr" style={{ fontSize: 15 }}>pending</span>
                  Pendiente de guardar
                </h4>
                {additionPreview ? (
                  <div className="license-total license-total--preview">
                    <span className="license-total__label">
                      {addedModuleIds.length} módulo{addedModuleIds.length === 1 ? '' : 's'} nuevo{addedModuleIds.length === 1 ? '' : 's'} marcado{addedModuleIds.length === 1 ? '' : 's'} en la pestaña Módulos
                      <br />
                      <small>
                        {additionPreview.isCustom ? 'Precio personalizado' : (
                          <>
                            Prorrateado {Math.round(additionPreview.fraction * 100)}% hasta el corte ({fmtDate(additionPreview.cutoff.toISOString())})
                            {additionPreview.discountAmount > 0 && ` · ${license.discountPercent}% dto. (−${fmtMoney(additionPreview.discountAmount, modulesCurrency)})`}
                          </>
                        )}
                        {' · se cobra al guardar los módulos'}
                      </small>
                    </span>
                    <span className="license-total__value">{fmtMoney(additionPreview.amount, modulesCurrency)}</span>
                  </div>
                ) : (
                  <small className="modal-hint" style={{ marginTop: 0 }}>
                    {addedModuleIds.length} módulo{addedModuleIds.length === 1 ? '' : 's'} nuevo{addedModuleIds.length === 1 ? '' : 's'} marcado{addedModuleIds.length === 1 ? '' : 's'} en Módulos, sin costo.
                  </small>
                )}

                {addedFullPrice > 0 && (
                  <div className="custom-price-row" style={{ marginTop: 12, marginBottom: 0 }}>
                    <label className="custom-price-row__check">
                      <input
                        type="checkbox"
                        className="ui-checkbox"
                        checked={useCustomPrice}
                        onChange={(e) => setUseCustomPrice(e.target.checked)}
                      />
                      Precio personalizado para este cobro
                    </label>
                    {useCustomPrice && (
                      <div className="custom-price-row__input">
                        <span>$</span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="Monto a cobrar (puede ser 0)"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <h4 className="modal-section__title" style={{ marginTop: 22 }}>
              <span className="msr" style={{ fontSize: 15 }}>receipt_long</span>
              Historial de cobros
            </h4>

            {totalPending > 0 && (
              <div className="license-total">
                <span className="license-total__label">Pendiente de pago</span>
                <span className="license-total__value">{fmtMoney(totalPending, chargesCurrency)}</span>
              </div>
            )}

            {charges.length === 0 ? (
              <small className="modal-hint" style={{ marginTop: 0 }}>Todavía no hay cobros registrados para esta licencia.</small>
            ) : (
              <div className="charges-list">
                {charges.map((c) => (
                  <div className={`charges-list__row ${c.status === 'cancelled' ? 'charges-list__row--cancelled' : ''}`} key={c.id}>
                    <div className="charges-list__info">
                      <div className="charges-list__desc">{c.description}</div>
                      <div className="charges-list__meta">
                        {fmtDate(c.createdAt)}
                        {c.periodEnd && ` · cubre hasta ${fmtDate(c.periodEnd)}`}
                        {c.discountAmount > 0 && ` · ${c.discountPercent}% dto. (−${fmtMoney(c.discountAmount, c.currency)})`}
                      </div>
                    </div>
                    {editingChargeId === c.id ? (
                      <div className="charges-list__amount charges-list__amount--editing">
                        <span>$</span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="charges-list__amount">{fmtMoney(c.amount, c.currency)}</div>
                    )}
                    <div className="charges-list__actions">
                      {c.status === 'paid' && <span className="charges-list__status charges-list__status--paid">Pagado</span>}
                      {c.status === 'cancelled' && <span className="charges-list__status charges-list__status--cancelled">Cancelado</span>}
                      {c.status === 'pending' && (
                        <>
                          <label className="charges-list__edit-toggle" title="Modificar el monto de este cobro (la deuda pendiente)">
                            <input
                              type="checkbox"
                              className="ui-checkbox"
                              checked={editingChargeId === c.id}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditingChargeId(c.id)
                                  setEditAmount(String(c.amount))
                                } else {
                                  setEditingChargeId(null)
                                }
                              }}
                            />
                          </label>
                          {editingChargeId === c.id && (
                            <button
                              type="button"
                              className="btn-icon btn-icon--success"
                              onClick={() => handleSaveChargeAmount(c.id)}
                              disabled={payingId === c.id}
                              title="Guardar nuevo monto"
                            >
                              <span className="msr" style={{ fontSize: 16 }}>check</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-secondary charges-list__pay-btn"
                            onClick={() => handleMarkPaid(c.id)}
                            disabled={payingId === c.id}
                          >
                            {payingId === c.id ? 'Guardando…' : 'Marcar pagado'}
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleCancelCharge(c.id)}
                            disabled={payingId === c.id}
                            title="Cancelar cobro (queda el registro)"
                          >
                            <span className="msr" style={{ fontSize: 16 }}>block</span>
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="btn-icon btn-icon--danger"
                        onClick={() => handleDeleteCharge(c.id)}
                        disabled={payingId === c.id}
                        title="Eliminar permanentemente"
                      >
                        <span className="msr" style={{ fontSize: 16 }}>delete_forever</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pendingCharges.length > 0 && (
              <>
                <small className="modal-hint" style={{ marginTop: 14 }}>
                  Se guardan al hacer clic en "Guardar configuración" (arriba).
                </small>
                <div className="charges-list">
                  {pendingCharges.map((pc, i) => (
                    <div className="charges-list__row charges-list__row--pending" key={i}>
                      <div className="charges-list__info">
                        <div className="charges-list__desc">{pc.description}</div>
                        <div className="charges-list__meta">Sin guardar todavía</div>
                      </div>
                      <div className="charges-list__amount">{fmtMoney(pc.amount, chargesCurrency)}</div>
                      <button
                        type="button"
                        className="btn-icon btn-icon--danger"
                        onClick={() => removePendingCharge(i)}
                        title="Quitar de la lista"
                      >
                        <span className="msr" style={{ fontSize: 16 }}>close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="charges-add">
              <input
                type="text"
                placeholder="Descripción (ej. Renovación anual)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Monto"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
              />
              <button type="button" className="btn-secondary" onClick={handleAddCharge}>
                <span className="msr" style={{ fontSize: 16 }}>add</span>
                Agregar cobro
              </button>
            </div>
            {chargeError && (
              <div className="modal-error">
                <span className="msr" style={{ fontSize: 16 }}>error</span>
                {chargeError}
              </div>
            )}
          </div>
        </div>

        <div className="modal__foot">
          {activeTab === 'modulos' && (
            <button type="button" className="btn-primary" onClick={handleSaveModules} disabled={savingModules}>
              {savingModules ? (
                <span className="msr licenses-spin" style={{ fontSize: 18 }}>progress_activity</span>
              ) : (
                <span className="msr" style={{ fontSize: 18 }}>save</span>
              )}
              {savingModules ? 'Guardando…' : 'Guardar módulos'}
            </button>
          )}
          {activeTab === 'limites' && (
            <button type="button" className="btn-primary" onClick={handleSaveLimits} disabled={savingLimits}>
              {savingLimits ? (
                <span className="msr licenses-spin" style={{ fontSize: 18 }}>progress_activity</span>
              ) : (
                <span className="msr" style={{ fontSize: 18 }}>save</span>
              )}
              {savingLimits ? 'Guardando…' : 'Guardar límites'}
            </button>
          )}
          {activeTab === 'facturacion' && (
            <button type="button" className="btn-primary" onClick={handleSaveBilling} disabled={savingBilling}>
              {savingBilling ? (
                <span className="msr licenses-spin" style={{ fontSize: 18 }}>progress_activity</span>
              ) : (
                <span className="msr" style={{ fontSize: 18 }}>save</span>
              )}
              {savingBilling ? 'Guardando…' : 'Guardar configuración'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
