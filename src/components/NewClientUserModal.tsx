import { useState, useEffect } from 'react'
import APIs, { type DeploymentMode } from '../services/APIs'


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MODE_LABEL: Record<DeploymentMode, string> = {
  CLOUD: 'Nube',
  LOCAL: 'Local',
  HYBRID: 'Híbrido',
  OFFLINE: 'Offline',
}

export const MODE_DESCRIPTION: Record<DeploymentMode, string> = {
  CLOUD: 'Corre en la nube de Fixora, con su propia base de datos dedicada.',
  LOCAL: 'Servidor propio del cliente, activación online una vez, sin sync después.',
  HYBRID: 'Servidor propio del cliente, con sincronización periódica hacia el admin.',
  OFFLINE: 'Nunca toca internet, ni para activar — se valida con un archivo firmado.',
}

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

type Tab = 'user' | 'env'

// La cuenta del cliente (login + en qué entorno vive). Separado de Licencias a
// propósito: un mismo usuario puede tener varias licencias después, sin repetir
// sus datos cada vez. En modo Nube, al guardar se crea ya mismo en su base dedicada
// — no hay instalador que el cliente corra.
export default function NewClientUserModal({ open, onClose, onCreated }: Props) {
  const [mode, setMode] = useState<DeploymentMode>('HYBRID')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('user')
  const [businessTypes, setBusinessTypes] = useState<any[]>([])
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('')

  useEffect(() => {
    if (open) {
      APIs.getBusinessTypes().then(res => {
        setBusinessTypes(res.data || [])
      }).catch(() => {})
    }
  }, [open])

  const isCloud = mode === 'CLOUD'
  // Nube: obligatorio, el admin provisiona la cuenta ahí mismo. Híbrido: opcional,
  // solo para dejar documentado el entorno del cliente y poder armarle su .env.
  const showsEnvFields = mode === 'CLOUD' || mode === 'HYBRID'

  const close = () => {
    if (submitting) return
    onClose()
    setMode('HYBRID')
    setFormError(null)
    setActiveTab('user')
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
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
    if (!password || password.length < 8) {
      setActiveTab('user')
      setFormError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (!firstName || !firstLastName || !secondLastName || !phone) {
      setActiveTab('user')
      setFormError('Nombre, apellidos y teléfono son obligatorios.')
      return
    }
    if (isCloud && (!databaseUrl || !directUrl || !supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !jwtSecret)) {
      setActiveTab('env')
      setFormError('En modo Nube, todos los campos del entorno dedicado son obligatorios.')
      return
    }

    setSubmitting(true)
    try {
      await APIs.createClientUser({
        email,
        password,
        firstName,
        firstLastName,
        secondLastName,
        phone,
        deploymentMode: mode,
        businessTypeId: selectedBusinessType ? parseInt(selectedBusinessType) : undefined,
        databaseUrl,
        directUrl,
        supabaseUrl,
        supabaseAnonKey,
        supabaseServiceRoleKey,
        jwtSecret,
      })
      close()
      onCreated()
    } catch (err: any) {
      setFormError(err.message || 'Error al crear el usuario.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={close}>
          <span className="msr">close</span>
        </button>
        <form className="modal__form" onSubmit={handleCreate}>
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
                  <input id="firstName" name="firstName" type="text" placeholder="Ej. Juan" />
                </div>
                <div className="form-group">
                  <label htmlFor="firstLastName">Apellido paterno *</label>
                  <input id="firstLastName" name="firstLastName" type="text" placeholder="Ej. Pérez" />
                </div>
                <div className="form-group">
                  <label htmlFor="secondLastName">Apellido materno *</label>
                  <input id="secondLastName" name="secondLastName" type="text" placeholder="Ej. López" />
                </div>
              </div>

              <div className="form-row form-row--triple">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" placeholder="dueño@empresa.com" />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Teléfono *</label>
                  <input id="phone" name="phone" type="tel" placeholder="Ej. 5512345678" />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Contraseña *</label>
                  <input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="businessType">Giro / Tipo de Negocio</label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={selectedBusinessType}
                    onChange={(e) => setSelectedBusinessType(e.target.value)}
                  >
                    <option value="">Seleccione un giro...</option>
                    {businessTypes.map(bt => (
                      <option key={bt.id} value={bt.id}>{bt.name}</option>
                    ))}
                  </select>
                </div>
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
                    {isCloud
                      ? 'Al guardar, se crea ahí mismo su cuenta — no necesita instalar nada. Es el equivalente al .env que tendría si fuera una instalación propia.'
                      : 'Opcional: documenta aquí el entorno de su instalación local para poder armarle su .env ya listo — el cliente sigue instalando y activando por su cuenta.'}
                  </small>
                  <div className="form-row form-row--triple">
                    <div className="form-group">
                      <label htmlFor="databaseUrl"><span className="env-tag">DATABASE_URL</span> {isCloud && '*'}</label>
                      <input id="databaseUrl" name="databaseUrl" type="text" placeholder="postgresql://usuario:password@host:6543/db?pgbouncer=true" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="directUrl"><span className="env-tag">DIRECT_URL</span> {isCloud && '*'}</label>
                      <input id="directUrl" name="directUrl" type="text" placeholder="postgresql://usuario:password@host:5432/db" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="jwtSecret"><span className="env-tag">JWT_SECRET</span> {isCloud && '*'}</label>
                      <input id="jwtSecret" name="jwtSecret" type="text" placeholder="secreto propio de este cliente" />
                    </div>
                  </div>
                  <div className="form-row form-row--triple">
                    <div className="form-group">
                      <label htmlFor="supabaseUrl"><span className="env-tag">SUPABASE_URL</span> {isCloud && '*'}</label>
                      <input id="supabaseUrl" name="supabaseUrl" type="text" placeholder="https://xxxx.supabase.co" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="supabaseAnonKey"><span className="env-tag">SUPABASE_ANON_KEY</span> {isCloud && '*'}</label>
                      <input id="supabaseAnonKey" name="supabaseAnonKey" type="text" placeholder="eyJhbGciOi..." />
                    </div>
                    <div className="form-group">
                      <label htmlFor="supabaseServiceRoleKey"><span className="env-tag">SUPABASE_SERVICE_ROLE_KEY</span> {isCloud && '*'}</label>
                      <input id="supabaseServiceRoleKey" name="supabaseServiceRoleKey" type="text" placeholder="eyJhbGciOi..." />
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
                <span className="msr" style={{ fontSize: 18 }}>add</span>
              )}
              {submitting ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
