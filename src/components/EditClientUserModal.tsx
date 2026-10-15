import { useState } from 'react'
import APIs, { type DeploymentMode } from '../services/APIs'
import { MODE_DESCRIPTION } from './NewClientUserModal'
import type { ClientUserRow } from '../pages/Users'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Tab = 'user' | 'env'

interface Props {
  open: boolean
  user: ClientUserRow | null
  onClose: () => void
  onUpdated: () => void
}

// Edita una cuenta de cliente ya creada. Los campos de entorno (DATABASE_URL, JWT_SECRET,
// etc.) nunca llegan desde el backend por seguridad — por eso aquí siempre aparecen en
// blanco con un hint de "sin cambios": si se dejan vacíos, el backend conserva lo que
// ya tenía guardado; solo se sobreescriben si se teclea un valor nuevo.
export default function EditClientUserModal({ open, user, onClose, onUpdated }: Props) {
  const [mode, setMode] = useState<DeploymentMode>(user?.deploymentMode ?? 'HYBRID')
  const [active, setActive] = useState(user?.active ?? true)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('user')
  const isCloud = mode === 'CLOUD'
  const showsEnvFields = mode === 'CLOUD' || mode === 'HYBRID'

  const close = () => {
    if (submitting) return
    onClose()
    setFormError(null)
    setActiveTab('user')
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting || !user) return
    const fd = new FormData(e.currentTarget)
    const str = (name: string) => (fd.get(name) as string)?.trim() || ''

    const email = str('email')
    const password = str('password')
    const firstName = str('firstName')
    const firstLastName = str('firstLastName')
    const secondLastName = str('secondLastName')
    const phone = str('phone')
    const databaseUrl = showsEnvFields ? str('databaseUrl') : undefined
    const directUrl = showsEnvFields ? str('directUrl') : undefined
    const supabaseUrl = showsEnvFields ? str('supabaseUrl') : undefined
    const supabaseAnonKey = showsEnvFields ? str('supabaseAnonKey') : undefined
    const supabaseServiceRoleKey = showsEnvFields ? str('supabaseServiceRoleKey') : undefined
    const jwtSecret = showsEnvFields ? str('jwtSecret') : undefined

    setFormError(null)
    if (!email || !EMAIL_RE.test(email)) {
      setActiveTab('user')
      setFormError('El email no es válido.')
      return
    }
    if (password && password.length < 8) {
      setActiveTab('user')
      setFormError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (!firstName || !firstLastName || !secondLastName || !phone) {
      setActiveTab('user')
      setFormError('Nombre, apellidos y teléfono son obligatorios.')
      return
    }

    setSubmitting(true)
    try {
      await APIs.updateClientUser(user.id, {
        email,
        password: password || undefined,
        firstName,
        firstLastName,
        secondLastName,
        phone,
        deploymentMode: mode,
        active,
        databaseUrl: databaseUrl || undefined,
        directUrl: directUrl || undefined,
        supabaseUrl: supabaseUrl || undefined,
        supabaseAnonKey: supabaseAnonKey || undefined,
        supabaseServiceRoleKey: supabaseServiceRoleKey || undefined,
        jwtSecret: jwtSecret || undefined,
      })
      close()
      onUpdated()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al actualizar el usuario.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open || !user) return null

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={close}>
          <span className="msr">close</span>
        </button>
        <form className="modal__form" onSubmit={handleUpdate}>
          <div className="modal-tabs">
            <button
              type="button"
              className={`modal-tab ${activeTab === 'user' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('user')}
            >
              <span className="msr" style={{ fontSize: 16 }}>person</span>
              Información del usuario
            </button>
            <button
              type="button"
              className={`modal-tab ${activeTab === 'env' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('env')}
            >
              <span className="msr" style={{ fontSize: 16 }}>dns</span>
              Base de datos y entorno
            </button>
          </div>
          <div className="modal__body">
            <div className="modal-section" hidden={activeTab !== 'user'}>
              <div className="form-row form-row--triple">
                <div className="form-group">
                  <label htmlFor="firstName">Nombre(s) *</label>
                  <input id="firstName" name="firstName" type="text" defaultValue={user.firstName} />
                </div>
                <div className="form-group">
                  <label htmlFor="firstLastName">Apellido paterno *</label>
                  <input id="firstLastName" name="firstLastName" type="text" defaultValue={user.firstLastName} />
                </div>
                <div className="form-group">
                  <label htmlFor="secondLastName">Apellido materno *</label>
                  <input id="secondLastName" name="secondLastName" type="text" defaultValue={user.secondLastName} />
                </div>
              </div>

              <div className="form-row form-row--triple">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" defaultValue={user.email} />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Teléfono *</label>
                  <input id="phone" name="phone" type="tel" defaultValue={user.phone} />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Nueva contraseña</label>
                  <input id="password" name="password" type="password" placeholder="Dejar en blanco para no cambiarla" />
                </div>
              </div>

              <div className="form-row form-row--single">
                <label className="modal-toggle">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  Cuenta activa
                </label>
              </div>
            </div>

            <div className="modal-section" hidden={activeTab !== 'env'}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="deploymentMode">Dónde vive este usuario *</label>
                  <select
                    id="deploymentMode"
                    name="deploymentMode"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as DeploymentMode)}
                    required
                  >
                    <option value="CLOUD">Nube (entorno dedicado)</option>
                    <option value="LOCAL">Local (sin sync)</option>
                    <option value="HYBRID">Híbrido (con sync)</option>
                    <option value="OFFLINE">Offline (archivo firmado)</option>
                  </select>
                </div>
              </div>
              <small className="modal-hint">{MODE_DESCRIPTION[mode]}</small>
              {showsEnvFields && (
                <>
                  <small className="modal-hint">
                    Por seguridad, estos valores nunca se muestran de vuelta. Déjalos en blanco
                    para conservar los que ya tiene guardados — solo escribe algo si quieres reemplazarlo.
                    {isCloud && ' En modo Nube, deben quedar guardados unos u otros (los anteriores o unos nuevos).'}
                  </small>
                  <div className="form-row form-row--triple">
                    <div className="form-group">
                      <label htmlFor="databaseUrl"><span className="env-tag">DATABASE_URL</span></label>
                      <input id="databaseUrl" name="databaseUrl" type="text" placeholder="•••••• (sin cambios)" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="directUrl"><span className="env-tag">DIRECT_URL</span></label>
                      <input id="directUrl" name="directUrl" type="text" placeholder="•••••• (sin cambios)" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="jwtSecret"><span className="env-tag">JWT_SECRET</span></label>
                      <input id="jwtSecret" name="jwtSecret" type="text" placeholder="•••••• (sin cambios)" />
                    </div>
                  </div>
                  <div className="form-row form-row--triple">
                    <div className="form-group">
                      <label htmlFor="supabaseUrl"><span className="env-tag">SUPABASE_URL</span></label>
                      <input id="supabaseUrl" name="supabaseUrl" type="text" placeholder="•••••• (sin cambios)" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="supabaseAnonKey"><span className="env-tag">SUPABASE_ANON_KEY</span></label>
                      <input id="supabaseAnonKey" name="supabaseAnonKey" type="text" placeholder="•••••• (sin cambios)" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="supabaseServiceRoleKey"><span className="env-tag">SUPABASE_SERVICE_ROLE_KEY</span></label>
                      <input id="supabaseServiceRoleKey" name="supabaseServiceRoleKey" type="text" placeholder="•••••• (sin cambios)" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {formError && (
              <div className="modal-error">
                <span className="msr" style={{ fontSize: 16 }}>error</span>
                {formError}
              </div>
            )}
          </div>
          <div className="modal__foot">
            <button type="button" className="btn-secondary" onClick={close} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <span className="msr licenses-spin" style={{ fontSize: 18 }}>progress_activity</span>
              ) : (
                <span className="msr" style={{ fontSize: 18 }}>save</span>
              )}
              {submitting ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
