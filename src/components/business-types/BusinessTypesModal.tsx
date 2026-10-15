import { useEffect, useState } from 'react'
import APIs from '../../services/APIs'
import '../../pages/pages.css'

interface BusinessType {
  id: number
  name: string
  description?: string
  icon?: string
  active: boolean
  sortOrder: number
  defaultModules?: { moduleId: string }[]
}

interface Props {
  type: BusinessType | null
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

export default function BusinessTypesModal({ type, isOpen, onClose, onSaved }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [active, setActive] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [availableModules, setAvailableModules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Load modules catalog
      APIs.getModulePricing().then((modules: any) => {
        setAvailableModules(modules)
      })

      if (type) {
        setName(type.name)
        setDescription(type.description || '')
        setIcon(type.icon || '')
        setActive(type.active)
        setSortOrder(type.sortOrder)
        setSelectedModules(type.defaultModules?.map(m => m.moduleId) || [])
      } else {
        setName('')
        setDescription('')
        setIcon('')
        setActive(true)
        setSortOrder(0)
        setSelectedModules([])
      }
    }
  }, [isOpen, type])

  const handleSave = async () => {
    if (!name) return alert('El nombre es obligatorio')
    setLoading(true)
    try {
      if (type) {
        await APIs.updateBusinessType(type.id, { name, description, icon, active, sortOrder })
        await APIs.updateBusinessTypeModules(type.id, selectedModules)
      } else {
        const newType = await APIs.createBusinessType({ name, description, icon, sortOrder })
        // Since createBusinessType returns { success, data }, we extract data.id
        const createdId = (newType as any).data?.id
        if (createdId) {
          await APIs.updateBusinessTypeModules(createdId, selectedModules)
        }
      }
      onSaved()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error al guardar el giro')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>
          <span className="msr">close</span>
        </button>

        <div className="modal__body">
          <h2>{type ? 'Editar Giro' : 'Nuevo Giro'}</h2>

          <div className="form-group">
            <label>Nombre</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Abarrotes" />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción corta..." />
          </div>

          <div className="form-group">
            <label>Icono (Material Icon)</label>
            <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="Ej. store" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Orden de prioridad</label>
              <input type="number" value={sortOrder} onChange={e => setSortOrder(+e.target.value)} />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
              <label className="ui-checkbox-label">
                <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="ui-checkbox" />
                Activo
              </label>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>Módulos por defecto</h4>
            <div className="license-modules" style={{ gridTemplateColumns: '1fr' }}>
              <div className="license-modules__group">
                {availableModules.map(mod => (
                  <label className="license-modules__child" key={mod.moduleId}>
                    <input
                      type="checkbox"
                      className="ui-checkbox"
                      checked={selectedModules.includes(mod.moduleId)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedModules([...selectedModules, mod.moduleId])
                        } else {
                          setSelectedModules(selectedModules.filter(id => id !== mod.moduleId))
                        }
                      }}
                    />
                    {mod.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal__foot">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Giro'}
          </button>
        </div>
      </div>
    </div>
  )
}
