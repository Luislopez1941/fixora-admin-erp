import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { CompanyModulesResponse, CompanyModule, UpdateCompanyModulesPayload } from '../lib/types'
import './pages.css'
import './CompanyModules.css'

const MODULE_ICONS: Record<string, string> = {
  'dashboard':      'dashboard',
  'sales':          'sell',
  'cobranza':       'payments',
  'shopping':       'shopping_cart',
  'cash-register':  'point_of_sale',
  'production':     'precision_manufacturing',
  'store':          'warehouse',
  'catalogos':      'inventory_2',
  'reports':        'assessment',
  'income':         'monetization_on',
  'users':          'group',
  'configurations': 'settings',
}

export default function CompanyModules() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<CompanyModulesResponse | null>(null)
  const [modules, setModules] = useState<CompanyModule[]>([])
  const originalRef = useRef<CompanyModule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get<CompanyModulesResponse>(`/platform/companies/${id}/modules`)
      .then((res) => {
        setData(res)
        setModules(res.modules)
        originalRef.current = res.modules
        setError(null)
      })
      .catch((err) => setError(err.message || 'Error cargando módulos'))
      .finally(() => setLoading(false))
  }, [id])

  const isDirty = modules.some(
    (m, i) => m.enabled !== (originalRef.current[i]?.enabled ?? false)
  )

  const handleToggle = (moduleId: string) => {
    setSuccess(null)
    setModules((prev) =>
      prev.map((m) => m.moduleId === moduleId ? { ...m, enabled: !m.enabled } : m)
    )
  }

  const handleEnableAll = () => {
    setSuccess(null)
    setModules((prev) => prev.map((m) => ({ ...m, enabled: true })))
  }

  const handleDisableAll = () => {
    setSuccess(null)
    setModules((prev) => prev.map((m) => ({ ...m, enabled: false })))
  }

  const handleReset = () => {
    setModules(originalRef.current)
    setSuccess(null)
    setError(null)
  }

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    const payload: UpdateCompanyModulesPayload = {
      modules: modules.map((m) => ({ moduleId: m.moduleId, enabled: m.enabled })),
    }
    try {
      await api.put(`/platform/companies/${id}/modules`, payload)
      originalRef.current = modules
      setSuccess('Módulos guardados correctamente')
    } catch (err: any) {
      setError(err.message || 'Error guardando cambios')
    } finally {
      setSaving(false)
    }
  }

  const enabledCount = modules.filter((m) => m.enabled).length

  if (loading) {
    return (
      <div className="page-container">
        <div className="cm-skeleton">
          {[...Array(12)].map((_, i) => <div key={i} className="cm-skeleton-card" />)}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="page-container">
        <div className="error-state">{error || 'No se pudieron cargar los datos'}</div>
      </div>
    )
  }

  return (
    <div className="page-container">

      {/* Header */}
      <div className="cm-header">
        <button className="btn-back" onClick={() => navigate('/companies')}>
          <span className="msr">arrow_back</span> Empresas
        </button>
        <div className="cm-header-info">
          <h1 className="page-title">Módulos contratados</h1>
          <p className="cm-subtitle">
            <span className="cm-company-badge">{data.company.businessName}</span>
          </p>
        </div>
        <div className="cm-header-actions">
          {isDirty && (
            <button className="btn-ghost" onClick={handleReset}>
              Descartar
            </button>
          )}
          <button
            className={`btn-primary ${isDirty ? 'btn-primary--dirty' : ''}`}
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            {saving ? 'Guardando…' : isDirty ? 'Guardar cambios' : 'Sin cambios'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Stats + bulk */}
      <div className="cm-toolbar">
        <div className="cm-stats">
          <span className="cm-stat cm-stat--on">{enabledCount} activos</span>
          <span className="cm-stat cm-stat--off">{modules.length - enabledCount} inactivos</span>
          <span className="cm-stat cm-stat--total">{modules.length} total</span>
        </div>
        <div className="cm-bulk">
          <button className="btn-bulk btn-bulk--on"  onClick={handleEnableAll}>Activar todos</button>
          <button className="btn-bulk btn-bulk--off" onClick={handleDisableAll}>Desactivar todos</button>
        </div>
      </div>

      {/* Grid */}
      <div className="cm-grid">
        {modules.map((mod) => (
          <div
            key={mod.moduleId}
            className={`cm-card ${mod.enabled ? 'cm-card--on' : 'cm-card--off'}`}
            onClick={() => handleToggle(mod.moduleId)}
          >
            <div className="cm-card-top">
              <span className="msr cm-card-icon">
                {MODULE_ICONS[mod.moduleId] ?? 'extension'}
              </span>
              <label className="switch" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={mod.enabled}
                  onChange={() => handleToggle(mod.moduleId)}
                />
                <span className="slider" />
              </label>
            </div>
            <h3 className="cm-card-name">{mod.name}</h3>
            <p className="cm-card-desc">{mod.description}</p>
            <div className="cm-card-footer">
              <span className={`cm-badge ${mod.enabled ? 'cm-badge--on' : 'cm-badge--off'}`}>
                {mod.enabled ? 'ACTIVO' : 'INACTIVO'}
              </span>
              <span className="cm-card-key">{mod.moduleId}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
