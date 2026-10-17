import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import APIs, { type DeploymentMode } from '../services/APIs'
import { useFetch } from '../lib/useFetch'
import { MODE_LABEL } from '../components/NewClientUserModal'
import './pages.css'
import './UserDetail.css'
import './ClientUserOverview.css'

interface ClientUserInfo {
  id: number
  email: string
  firstName: string
  firstLastName: string
  secondLastName: string
  phone: string
  deploymentMode: DeploymentMode
  active: boolean
  createdAt: string
  hasDedicatedDatabase: boolean
}

interface LicenseOverview {
  key: string
  status: 'active' | 'blocked' | 'expired'
  deploymentMode: DeploymentMode
  modules: string[]
  maxCompanies: number | null
  maxBranches: number | null
  maxUsers: number | null
  billingCycle: string
  discountPercent: number
  expiresAt: string | null
  activatedAt: string | null
  valueMonthly: number
  valueAnnual: number
  currency: string
}

interface UsageCompany {
  id: number
  name: string
  businessName: string
  createdAt: string
  branchesCount: number
  usersCount: number
  customersCount: number
  salesCount: number
}

interface Usage {
  companiesCount: number
  branchesCount: number
  usersCount: number
  companies: UsageCompany[]
}

interface OverviewResponse {
  success: boolean
  clientUser: ClientUserInfo
  licenses: LicenseOverview[]
  totalValue: { monthly: number; annual: number; currency: string }
  usage: Usage | null
}

const STATUS_LABEL: Record<string, string> = { active: 'Activa', blocked: 'Bloqueada', expired: 'Expirada' }

const fmt = (n: number, currency = 'MXN') => new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(n)
const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : '—')

// La "limite" sin número = ilimitado.
const fmtLimit = (n: number | null) => (n == null ? 'Ilimitado' : String(n))

export default function ClientUserOverview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const { data, loading, error } = useFetch<OverviewResponse>(
    () => APIs.getClientUserOverview<OverviewResponse>(id as string),
    [id],
  )

  if (loading) return <div className="state">Cargando…</div>
  if (error || !data) return <div className="state state--error">{error ?? 'Cliente no encontrado'}</div>

  const { clientUser: u, licenses, totalValue, usage } = data
  const fullName = `${u.firstName} ${u.firstLastName} ${u.secondLastName}`.trim()

  const syncWithErp = async () => {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res: any = await APIs.syncClientUserWithErp(u.id)
      setSyncMsg(res?.success
        ? { ok: true, text: res.connectionChanged ? 'Sincronizado: el ERP ya usa la nueva base de datos.' : 'Sincronizado con el ERP.' }
        : { ok: false, text: res?.message ?? 'No se pudo sincronizar.' })
    } catch (e: any) {
      setSyncMsg({ ok: false, text: e.message ?? 'No se pudo sincronizar.' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="ud-page">
      {/* Topbar */}
      <div className="ud-topbar">
        <button className="ud-back" onClick={() => navigate(-1)}>
          <span className="msr">arrow_back</span> Volver
        </button>
        <div className="ud-header">
          <span className="ud-avatar">{fullName.charAt(0).toUpperCase()}</span>
          <div className="ud-header-info">
            <h1 className="ud-header-name">{fullName}</h1>
            <div className="ud-header-meta">
              <span className="ud-header-email">{u.email}</span>
              <span className={`badge badge--mode-${u.deploymentMode.toLowerCase()}`}>{MODE_LABEL[u.deploymentMode]}</span>
            </div>
          </div>
        </div>
        <span className={`badge ${u.active ? 'badge--ok' : 'badge--off'}`}>{u.active ? 'Activo' : 'Inactivo'}</span>
        {u.hasDedicatedDatabase && (
          <button
            className="ud-back"
            onClick={syncWithErp}
            disabled={syncing}
            title="El ERP vuelve a leer la conexión, licencia y módulos de este cliente"
          >
            <span className="msr">sync</span> {syncing ? 'Sincronizando…' : 'Sincronizar'}
          </button>
        )}
      </div>
      {syncMsg && <div className={`state ${syncMsg.ok ? '' : 'state--error'}`}>{syncMsg.text}</div>}

      {/* Resumen */}
      <div className="ud-summary">
        <div className="ud-summary-chip cuo-summary-chip--value">
          <span className="msr">payments</span>
          <strong>{fmt(totalValue.monthly, totalValue.currency)}</strong>
          /mes contratado
        </div>
        <div className="ud-summary-chip">
          <span className="msr">business</span>
          <strong>{usage ? usage.companiesCount : '—'}</strong>
          empresa{usage?.companiesCount !== 1 ? 's' : ''}
        </div>
        <div className="ud-summary-chip">
          <span className="msr">location_on</span>
          <strong>{usage ? usage.branchesCount : '—'}</strong>
          sucursal{usage?.branchesCount !== 1 ? 'es' : ''}
        </div>
        <div className="ud-summary-chip">
          <span className="msr">group</span>
          <strong>{usage ? usage.usersCount : '—'}</strong>
          usuario{usage?.usersCount !== 1 ? 's' : ''}
        </div>
        <div className="ud-summary-chip">
          <span className="msr">key</span>
          <strong>{licenses.length}</strong>
          licencia{licenses.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Licencias */}
      <div>
        <p className="ud-companies-title">Licencias</p>
        {licenses.length === 0 ? (
          <div className="state">Sin licencias asignadas todavía.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {licenses.map((l) => (
              <div className="ud-company-card" key={l.key}>
                <div className="ud-company-head">
                  <span className={`cuo-license-icon cuo-license-icon--${l.status}`}>
                    <span className="msr" style={{ fontSize: 22 }}>key</span>
                  </span>
                  <div className="ud-company-body">
                    <h3 className="ud-company-name">{l.key}</h3>
                    <p className="ud-company-biz">
                      {l.modules.length} módulo{l.modules.length !== 1 ? 's' : ''} · Ciclo {l.billingCycle === 'monthly' ? 'mensual' : 'anual'}
                      {l.discountPercent > 0 && ` · ${l.discountPercent}% dto.`}
                    </p>
                    <div className="ud-company-stats">
                      <span className="ud-company-stat">
                        <span className="msr" style={{ fontSize: 14 }}>apartment</span> {fmtLimit(l.maxCompanies)} empresas
                      </span>
                      <span className="ud-company-stat">
                        <span className="msr" style={{ fontSize: 14 }}>storefront</span> {fmtLimit(l.maxBranches)} sucursales
                      </span>
                      <span className="ud-company-stat">
                        <span className="msr" style={{ fontSize: 14 }}>group</span> {fmtLimit(l.maxUsers)} usuarios
                      </span>
                      <span className="ud-company-stat ud-billing-chip">
                        <span className="msr" style={{ fontSize: 13 }}>sell</span>
                        {fmt(l.billingCycle === 'monthly' ? l.valueMonthly : l.valueAnnual, l.currency)}/{l.billingCycle === 'monthly' ? 'mes' : 'año'}
                      </span>
                    </div>
                  </div>
                  <div className="cuo-license-side">
                    <span className={`cuo-status-pill cuo-status-pill--${l.status}`}>{STATUS_LABEL[l.status] ?? l.status}</span>
                    <span className="cuo-license-exp">{l.expiresAt ? `Vence ${fmtDate(l.expiresAt)}` : 'Sin vencimiento'}</span>
                  </div>
                </div>
                {l.modules.length > 0 && (
                  <div className="cuo-module-chips">
                    {l.modules.map((m) => (
                      <span className="cuo-module-chip" key={m}>{m}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Uso real */}
      <div>
        <p className="ud-companies-title">Empresas (uso real en su base)</p>
        {!usage ? (
          <div className="state state--error">No se pudo conectar a la base de este cliente ahora mismo — intenta de nuevo en un momento.</div>
        ) : usage.companies.length === 0 ? (
          <div className="state">Todavía no ha creado ninguna empresa.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {usage.companies.map((c) => (
              <div className="ud-company-card" key={c.id}>
                <div className="ud-company-head">
                  <span className="ud-company-avatar">{c.name.charAt(0).toUpperCase()}</span>
                  <div className="ud-company-body">
                    <h3 className="ud-company-name">{c.businessName}</h3>
                    <p className="ud-company-biz">{c.name}</p>
                    <div className="ud-company-stats">
                      <span className="ud-company-stat"><span className="msr" style={{ fontSize: 14 }}>store</span> {c.branchesCount} sucursal{c.branchesCount !== 1 ? 'es' : ''}</span>
                      <span className="ud-company-stat"><span className="msr" style={{ fontSize: 14 }}>group</span> {c.usersCount} usuario{c.usersCount !== 1 ? 's' : ''}</span>
                      <span className="ud-company-stat"><span className="msr" style={{ fontSize: 14 }}>receipt_long</span> {c.salesCount} ventas</span>
                      <span className="ud-company-stat"><span className="msr" style={{ fontSize: 14 }}>person</span> {c.customersCount} clientes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
