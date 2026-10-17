import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import APIs from '../services/APIs'
import { useFetch } from '../lib/useFetch'
import type { UserDetail, UserCompanyDetail, CompanyDetail, CompanyBilling } from '../lib/types'
import './pages.css'
import './UserDetail.css'
import { moduleIcon } from '../lib/moduleMeta'

/** Mapeo moduleId → nombre de icono en Material Symbols Rounded */
const KIND_LABEL: Record<string, string> = {
  SYSTEM: 'Super Admin', ACCOUNT: 'Dueño de empresa', STAFF: 'Empleado',
}

/* ── Modal editable de módulos ── */
function ModulesModal({ companyId, title, onClose }: {
  companyId: number
  title: string
  onClose: () => void
}) {
  const { data, loading, error } = useFetch<CompanyDetail>(
    () => APIs.getCompanyDetail<CompanyDetail>(companyId),
    [companyId],
  )

  const [localMods, setLocalMods] = useState<Record<string, boolean>>({})
  const [initialized, setInitialized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Inicializar estado local una vez que llegan los datos
  if (data && !initialized) {
    const init: Record<string, boolean> = {}
    data.modules.forEach(m => { init[m.moduleId] = m.enabled })
    setLocalMods(init)
    setInitialized(true)
  }

  const toggle = (moduleId: string) => {
    setSaveMsg(null)
    setLocalMods(prev => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  const save = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      await APIs.updateCompanyModules(companyId, {
        modules: Object.entries(localMods).map(([moduleId, enabled]) => ({
          moduleId, enabled,
        })),
      })
      setSaveMsg({ ok: true, text: 'Cambios guardados correctamente.' })
    } catch (e: any) {
      setSaveMsg({ ok: false, text: e.message ?? 'Error al guardar.' })
    } finally {
      setSaving(false)
    }
  }

  const enabledCount  = Object.values(localMods).filter(Boolean).length
  const disabledCount = Object.values(localMods).filter(v => !v).length
  const modules = data?.modules ?? []

  return (
    <div className="mod-overlay" onClick={onClose}>
      <div className="mod-modal" onClick={e => e.stopPropagation()}>

        {/* Cabecera */}
        <div className="mod-modal-head">
          <div>
            <h3 className="mod-modal-title">Módulos de la empresa</h3>
            <p className="mod-modal-sub">{title}</p>
          </div>
          <button className="mod-modal-close" onClick={onClose}>
            <span className="msr">close</span>
          </button>
        </div>

        {loading && <div className="state">Cargando módulos…</div>}
        {error   && <div className="state state--error">{error}</div>}

        {initialized && (
          <>
            {/* Contadores */}
            <div className="mod-counts">
              <span className="mod-count-chip mod-count-chip--on">
                <span className="msr" style={{ fontSize: 14 }}>check_circle</span>
                {enabledCount} activos
              </span>
              <span className="mod-count-chip mod-count-chip--off">
                <span className="msr" style={{ fontSize: 14 }}>cancel</span>
                {disabledCount} inactivos
              </span>
            </div>

            {/* Grid de módulos */}
            <div className="mod-grid">
              {modules.map(mod => {
                const isOn = localMods[mod.moduleId] ?? false
                return (
                  <button
                    key={mod.moduleId}
                    className={`mod-card ${isOn ? 'mod-card--on' : 'mod-card--off'}`}
                    onClick={() => toggle(mod.moduleId)}
                    title={mod.description}
                    type="button"
                  >
                    <span className={`msr mod-card-icon ${isOn ? 'mod-card-icon--on' : 'mod-card-icon--off'}`}>
                      {moduleIcon(mod.moduleId)}
                    </span>
                    <span className="mod-card-name">{mod.name}</span>
                    <span className={`msr mod-card-toggle ${isOn ? 'mod-card-toggle--on' : 'mod-card-toggle--off'}`}>
                      {isOn ? 'toggle_on' : 'toggle_off'}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Feedback de guardado */}
            {saveMsg && (
              <div className={`mod-save-msg ${saveMsg.ok ? 'mod-save-msg--ok' : 'mod-save-msg--err'}`}>
                <span className="msr" style={{ fontSize: 16 }}>
                  {saveMsg.ok ? 'check_circle' : 'error'}
                </span>
                {saveMsg.text}
              </div>
            )}

            {/* Acciones */}
            <div className="mod-footer">
              <button className="mod-btn-cancel" onClick={onClose} type="button">
                Cancelar
              </button>
              <button
                className="mod-btn-save"
                onClick={save}
                disabled={saving}
                type="button"
              >
                {saving
                  ? <><span className="msr mod-spin" style={{ fontSize: 16 }}>progress_activity</span> Guardando…</>
                  : <><span className="msr" style={{ fontSize: 16 }}>save</span> Guardar cambios</>
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

/* ── Tarjeta de empresa con sucursales expandibles ── */
function CompanyCard({ company, onModules }: {
  company: UserCompanyDetail
  onModules: (companyId: number, title: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const { data: billing } = useFetch<CompanyBilling>(
    () => APIs.getCompanyBilling<CompanyBilling>(company.id),
    [company.id],
  )

  return (
    <div className="ud-company-card">
      <div className="ud-company-head">

        {/* Avatar */}
        <span className="ud-company-avatar">
          {company.name.charAt(0).toUpperCase()}
        </span>

        {/* Info */}
        <div className="ud-company-body">
          <h3 className="ud-company-name">{company.businessName}</h3>
          <p className="ud-company-biz">{company.name} · RFC: {company.taxId ?? '—'}</p>
          <div className="ud-company-stats">
            <span className="ud-company-stat"><span className="msr" style={{ fontSize: 14 }}>store</span> {company.branches.length} sucursal{company.branches.length !== 1 ? 'es' : ''}</span>
            <span className="ud-company-stat"><span className="msr" style={{ fontSize: 14 }}>receipt_long</span> {company.salesCount} ventas</span>
            <span className="ud-company-stat"><span className="msr" style={{ fontSize: 14 }}>person</span> {company.customersCount} clientes</span>
            {billing && billing.totalMonthly > 0 && (
              <span className="ud-company-stat ud-billing-chip">
                <span className="msr" style={{ fontSize: 13 }}>sell</span>
                {fmt(billing.totalMonthly)}/mes
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="ud-company-actions">
          <button
            className="ud-btn-modules"
            onClick={() => onModules(company.id, company.businessName)}
          >
            <span className="msr" style={{ fontSize: 15 }}>extension</span>
            Módulos
          </button>
          <button
            className={`ud-btn-expand ${expanded ? 'ud-btn-expand--active' : ''}`}
            onClick={() => setExpanded(p => !p)}
          >
            <span className="msr" style={{ fontSize: 15 }}>{expanded ? 'expand_less' : 'expand_more'}</span>
            Sucursales
          </button>
        </div>
      </div>

      {/* Sucursales */}
      {expanded && (
        <div className="ud-branches-panel">
          <p className="ud-branches-label">
            Sucursales ({company.branches.length})
          </p>

          {company.branches.length === 0 ? (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Sin sucursales registradas.
            </span>
          ) : (
            company.branches.map(b => (
              <div key={b.id} className="ud-branch-row">
                <span className="msr ud-branch-icon">location_on</span>
                <div className="ud-branch-info">
                  <div className="ud-branch-name">{b.name}</div>
                  {b.address && <div className="ud-branch-addr">{b.address}</div>}
                </div>
                <button
                  className="ud-btn-modules"
                  onClick={() => onModules(company.id, `${company.businessName} · ${b.name}`)}
                >
                  <span className="msr" style={{ fontSize: 14 }}>extension</span> Módulos
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ── Página principal ── */
export default function UserDetailPage() {
  const { clientUserId, userId } = useParams<{ clientUserId: string; userId: string }>()
  const navigate = useNavigate()
  const [modal, setModal] = useState<{ companyId: number; title: string } | null>(null)

  const { data: user, loading, error } = useFetch<UserDetail>(
    () => APIs.getUserDetail<UserDetail>(clientUserId as string, userId as string),
    [clientUserId, userId],
  )

  if (loading) return <div className="state">Cargando…</div>
  if (error || !user) return (
    <div className="state state--error">{error ?? 'Usuario no encontrado'}</div>
  )

  const totalBranches = user.companies.reduce((s, c) => s + c.branches.length, 0)

  return (
    <div className="ud-page">

      {/* Topbar: back + header + badge */}
      <div className="ud-topbar">
        <button className="ud-back" onClick={() => navigate(-1)}>
          <span className="msr">arrow_back</span> Volver
        </button>
        <div className="ud-header">
          <span className="ud-avatar">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="ud-header-info">
            <h1 className="ud-header-name">{user.name}</h1>
            <div className="ud-header-meta">
              <span className="ud-header-email">{user.email}</span>
              <span className="ud-header-role">{KIND_LABEL[user.userKind] ?? user.userKind}</span>
              {user.role && <span className="ud-header-role">{user.role}</span>}
            </div>
          </div>
        </div>
        <span className={`badge ${user.active ? 'badge--ok' : 'badge--off'}`}>
          {user.active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Resumen */}
      <div className="ud-summary">
        <div className="ud-summary-chip">
          <span className="msr">business</span>
          <strong>{user.companies.length}</strong>
          empresa{user.companies.length !== 1 ? 's' : ''}
        </div>
        <div className="ud-summary-chip">
          <span className="msr">location_on</span>
          <strong>{totalBranches}</strong>
          sucursal{totalBranches !== 1 ? 'es' : ''}
        </div>
        <div className="ud-summary-chip">
          <span className="msr">calendar_today</span>
          Alta {new Date(user.createdAt).toLocaleDateString('es-MX')}
        </div>
      </div>

      {/* Empresas */}
      <div>
        <p className="ud-companies-title">Empresas asignadas</p>
        {user.companies.length === 0 ? (
          <div className="state">Sin empresas asignadas.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {user.companies.map(company => (
              <CompanyCard
                key={company.id}
                company={company}
                onModules={(companyId, title) => setModal({ companyId, title })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <ModulesModal
          companyId={modal.companyId}
          title={modal.title}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
