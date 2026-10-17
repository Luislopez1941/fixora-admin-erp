import { useState } from 'react'
import APIs from '../services/APIs'
import { useFetch } from '../lib/useFetch'
import './pages.css'
import './BusinessTypes.css'
import { moduleIcon } from '../lib/moduleMeta'

const MOD_LABEL: Record<string, string> = {
  dashboard:      'Dashboard',
  sales:          'Ventas',
  cobranza:       'Cobranza',
  shopping:       'Compras',
  'cash-register':'Caja',
  production:     'Producción',
  store:          'Almacén',
  catalogos:      'Catálogos',
  reports:        'Reportes',
  income:         'Ingresos',
  users:          'Usuarios',
  configurations: 'Configuraciones',
}

interface DefaultModule {
  id: number
  businessTypeId: number
  moduleId: string
  createdAt: string
}

interface BusinessTypeRow {
  id: number
  key: string
  name: string
  description: string | null
  icon: string | null
  active: boolean
  sortOrder: number
  defaultModules: DefaultModule[]
}

interface ApiResponse<T> {
  data: T
  status: string
  message: string
}

const EMPTY_FORM = {
  key: '',
  name: '',
  description: '',
  icon: 'store',
  sortOrder: 0,
}

export default function BusinessTypes() {
  const { data: response, loading, error, refetch } = useFetch<ApiResponse<BusinessTypeRow[]>>(
    () => APIs.getBusinessTypes<ApiResponse<BusinessTypeRow[]>>(),
  )
  const data = response?.data ?? null

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  // Modules Modal state
  const [modulesModalOpen, setModulesModalOpen] = useState(false)
  const [selectedBtForModules, setSelectedBtForModules] = useState<BusinessTypeRow | null>(null)
  const [tempModules, setTempModules] = useState<string[]>([])

  const allModuleIds = Object.keys(MOD_LABEL)

  const openCreate = () => {
    setModalMode('create')
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (bt: BusinessTypeRow) => {
    setModalMode('edit')
    setEditingId(bt.id)
    setForm({
      key: bt.key,
      name: bt.name,
      description: bt.description || '',
      icon: bt.icon || 'store',
      sortOrder: bt.sortOrder,
    })
    setModalOpen(true)
  }

  const openModules = (bt: BusinessTypeRow) => {
    setSelectedBtForModules(bt)
    setTempModules(bt.defaultModules.map(m => m.moduleId))
    setModulesModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const closeModulesModal = () => {
    setModulesModalOpen(false)
    setSelectedBtForModules(null)
  }

  const handleSaveModules = async () => {
    if (!selectedBtForModules) return
    setSaving(true)
    setMsg(null)
    try {
      await APIs.updateBusinessTypeModules(selectedBtForModules.id, tempModules)
      setMsg({ ok: true, text: 'Módulos actualizados correctamente' })
      refetch()
      closeModulesModal()
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || 'Error al actualizar módulos' })
    } finally {
      setSaving(false)
    }
  }

  const toggleTempModule = (modId: string) => {
    setTempModules(prev =>
      prev.includes(modId)
        ? prev.filter(id => id !== modId)
        : [...prev, modId]
    )
  }

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.key.trim() || !form.name.trim()) {
      setMsg({ ok: false, text: 'Key y Nombre son obligatorios' })
      return
    }
    setSaving(true)
    setMsg(null)
    try {
      if (modalMode === 'create') {
        await APIs.createBusinessType(form)
        setMsg({ ok: true, text: 'Giro creado correctamente' })
      } else if (editingId) {
        await APIs.updateBusinessType(editingId, form)
        setMsg({ ok: true, text: 'Giro actualizado correctamente' })
      }
      closeModal()
      refetch()
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este giro?')) return
    setSaving(true)
    setMsg(null)
    try {
      await APIs.deleteBusinessType(id)
      setMsg({ ok: true, text: 'Giro eliminado' })
      refetch()
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || 'Error al eliminar' })
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (bt: BusinessTypeRow) => {
    setSaving(true)
    setMsg(null)
    try {
      await APIs.updateBusinessType(bt.id, { active: !bt.active })
      setMsg({ ok: true, text: 'Estado actualizado' })
      refetch()
    } catch (e: any) {
      setMsg({ ok: false, text: e.message || 'Error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {msg && (
        <div className={`alert ${msg.ok ? 'alert--success' : 'alert--error'}`}>
          {msg.text}
        </div>
      )}

      <div style={{ padding: '8px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button className="btn--primary" onClick={openCreate}>
            <span className="msr" style={{ fontSize: 18 }}>add</span>
            Crear giro
          </button>
        </div>

        {loading ? (
          <div className="state">Cargando…</div>
        ) : error ? (
          <div className="state state--error">{error}</div>
        ) : !data?.length ? (
          <div className="state">No hay giros registrados.</div>
        ) : (
          <div className="business-types__list">
            {data.map((bt) => {
              return (
                <div key={bt.id} className={`business-types__card${bt.active ? '' : ' business-types__card--inactive'}`}>
                  <div className="business-types__card-header">
                    <div className="business-types__card-title">
                      <div className="icon-box">
                        <span className="msr">{bt.icon || 'store'}</span>
                      </div>
                      <div className="text-content">
                        <strong>{bt.name}</strong>
                        <small>{bt.description || '—'}</small>
                      </div>
                    </div>
                  </div>
                  <div className="business-types__card-actions-row">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={bt.active}
                        onChange={() => toggleActive(bt)}
                        disabled={saving}
                      />
                      <span className="toggle__slider" />
                      <span className="toggle__label">{bt.active ? 'Activo' : 'Inactivo'}</span>
                    </label>
                    <div className="business-types__card-actions">
                      <button className="btn--ghost" onClick={() => openEdit(bt)} title="Editar">
                        <span className="msr">edit</span>
                      </button>
                      <button className="btn--ghost btn--danger" onClick={() => handleDelete(bt.id)} title="Eliminar">
                        <span className="msr">delete</span>
                      </button>
                      <button
                        className="btn--ghost"
                        onClick={() => openModules(bt)}
                        title="Módulos"
                      >
                        <span className="msr">settings</span>
                      </button>
                    </div>
                  </div>

                  <div className="business-types__modules">
                    {(bt.defaultModules ?? []).length === 0 ? (
                      <span className="business-types__modules-empty">Sin módulos por defecto</span>
                    ) : (
                      (bt.defaultModules ?? []).map((m) => (
                        <span key={m.id} className="business-types__module-chip">
                          <span className="msr" style={{ fontSize: 14 }}>
                            {moduleIcon(m.moduleId, 'widgets')}
                          </span>
                          {MOD_LABEL[m.moduleId] || m.moduleId}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Principal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal__head">
              <h3>{modalMode === 'create' ? 'Crear nuevo giro' : 'Editar giro'}</h3>
              <button className="modal__close" onClick={closeModal}>
                <span className="msr">close</span>
              </button>
            </div>
            <div className="modal__body">
              <div className="form-row">
                <label className="form-label">Key (identificador único)</label>
                <input
                  className="form-input"
                  value={form.key}
                  onChange={(e) => updateField('key', e.target.value)}
                  placeholder="ej. grocery"
                />
              </div>
              <div className="form-row">
                <label className="form-label">Nombre</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="ej. Abarrotes"
                />
              </div>
              <div className="form-row">
                <label className="form-label">Descripción</label>
                <input
                  className="form-input"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Breve descripción del giro"
                />
              </div>
              <div className="form-row">
                <label className="form-label">Icono (Material Symbol)</label>
                <input
                  className="form-input"
                  value={form.icon}
                  onChange={(e) => updateField('icon', e.target.value)}
                  placeholder="ej. storefront"
                />
              </div>
              <div className="form-row">
                <label className="form-label">Orden</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => updateField('sortOrder', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="modal__foot">
              <button className="btn--ghost" onClick={closeModal}>Cancelar</button>
              <button className="btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : modalMode === 'create' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Módulos */}
      {modulesModalOpen && selectedBtForModules && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && closeModulesModal()}>
          <div className="modal">
            <div className="modal__head">
              <h3>Módulos: {selectedBtForModules.name}</h3>
              <button className="modal__close" onClick={closeModulesModal}>
                <span className="msr">close</span>
              </button>
            </div>
            <div className="modal__body">
              <p className="business-types__editor-title">Seleccione los módulos por defecto</p>
              <div className="business-types__editor-grid">
                {allModuleIds.map((modId) => (
                  <label key={modId} className="business-types__editor-item">
                    <input
                      type="checkbox"
                      checked={tempModules.includes(modId)}
                      onChange={() => toggleTempModule(modId)}
                      disabled={saving}
                    />
                    <span className="msr" style={{ fontSize: 18 }}>
                      {moduleIcon(modId, 'widgets')}
                    </span>
                    <span>{MOD_LABEL[modId] || modId}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal__foot">
              <button className="btn--ghost" onClick={closeModulesModal}>Cancelar</button>
              <button className="btn--primary" onClick={handleSaveModules} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar Módulos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
