import { useState } from 'react'
import APIs from '../services/APIs'
import type { ClientUserRow } from '../pages/Users'

interface Props {
  open: boolean
  user: ClientUserRow | null
  onClose: () => void
  onRetried: () => void
}

// Reintenta crear al dueño en su base dedicada (CLOUD) cuando el primer intento
// falló — pide la contraseña de nuevo porque solo se guarda el hash, nunca el
// texto plano, así que no hay forma de reenviarla automáticamente.
export default function RetryProvisioningModal({ open, user, onClose, onRetried }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const close = () => {
    if (submitting) return
    onClose()
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting || !user) return
    const fd = new FormData(e.currentTarget)
    const password = (fd.get('password') as string)?.trim()

    setFormError(null)
    if (!password || password.length < 8) {
      setFormError('Escribe la contraseña de este usuario (mínimo 8 caracteres).')
      return
    }

    setSubmitting(true)
    try {
      await APIs.retryProvisioning(user.id, password)
      close()
      onRetried()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo reintentar.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open || !user) return null

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={close}>
          <span className="msr">close</span>
        </button>
        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="modal-section">
              <h4 className="modal-section__title">
                <span className="msr" style={{ fontSize: 15 }}>refresh</span>
                Reintentar configuración
              </h4>
              <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: '#5a6072' }}>
                Vuelve a intentar crear la cuenta de <strong>{user.email}</strong> en su base dedicada
                (corre las migraciones si hace falta y crea su usuario).
              </p>
              {user.provisioningError && (
                <div className="modal-error" style={{ marginBottom: 16 }}>
                  <span className="msr" style={{ fontSize: 16 }}>error</span>
                  {user.provisioningError}
                </div>
              )}
              <div className="form-row form-row--single">
                <div className="form-group">
                  <label htmlFor="password">Contraseña de este usuario *</label>
                  <input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" autoFocus />
                </div>
              </div>
              {formError && (
                <div className="modal-error">
                  <span className="msr" style={{ fontSize: 16 }}>error</span>
                  {formError}
                </div>
              )}
            </div>
          </div>
          <div className="modal__foot">
            <button type="button" className="btn-secondary" onClick={close} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <span className="msr licenses-spin" style={{ fontSize: 18 }}>progress_activity</span>
              ) : (
                <span className="msr" style={{ fontSize: 18 }}>refresh</span>
              )}
              {submitting ? 'Reintentando…' : 'Reintentar ahora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
