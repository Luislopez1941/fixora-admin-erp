import { useEffect, useState } from 'react'
import APIs from '../services/APIs'
import '../pages/pages.css'
import '../pages/Licenses.css'

interface License {
  id: number
  key: string
  type: string
  status: 'active' | 'blocked' | 'expired'
  deploymentMode: string
  companyName: string | null
  branchName: string | null
  clientUser: {
    id: number
    email: string
    firstName: string
    firstLastName: string
    secondLastName: string
  } | null
  machineId: string | null
  erpUserId: number | null
  erpInstanceUrl: string | null
  activatedAt: string | null
  lastValidated: string | null
  expiresAt: string | null
  createdAt: string
  modules: string[]
  maxCompanies: number | null
  maxBranches: number | null
  maxUsers: number | null
  billingCycle: string
  cycleStartDate: string | null
  discountPercent: number
}

interface SyncStatus {
  total: number
  pending: number
  processed: number
}

interface Props {
  license: License | null
  isOpen: boolean
  onClose: () => void
}

export default function LicenseDetailsModal({ license, isOpen, onClose }: Props) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && license) {
      setLoading(true)
      setSyncStatus(null)
      APIs.getSyncStatus<{ sync: SyncStatus }>(license.key)
        .then(res => setSyncStatus(res.sync))
        .catch(err => console.error('Error loading sync status:', err))
        .finally(() => setLoading(false))
    }
  }, [isOpen, license])

  if (!isOpen || !license) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>
          <span className="msr">close</span>
        </button>

        <div className="modal__body">
          <h2 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="msr" style={{ fontSize: 24 }}>info</span>
            Detalles de la Licencia
          </h2>

          <div className="license-detail">
            <div className="license-detail-section">
              <h4>
                <span className="msr" style={{ fontSize: 16 }}>description</span>
                Configuración de Licencia
              </h4>
              <div className="license-info-grid">
                <span className="license-info-label">Módulos:</span>
                <div className="license-modules-tags">
                  {license.modules.length ? license.modules.map(m => (
                    <span key={m} className="license-module-tag">{m}</span>
                  )) : 'Ninguno'}
                </div>
                <span className="license-info-label">Límite Empresas:</span>
                <span className="license-info-value">{license.maxCompanies ?? '∞'}</span>
                <span className="license-info-label">Límite Sucursales:</span>
                <span className="license-info-value">{license.maxBranches ?? '∞'}</span>
                <span className="license-info-label">Límite Usuarios:</span>
                <span className="license-info-value">{license.maxUsers ?? '∞'}</span>
                <span className="license-info-label">Vencimiento:</span>
                <span className="license-info-value">
                  {license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : 'Ilimitada'}
                </span>
              </div>
            </div>

            <div className="license-detail-section">
              <h4>
                <span className="msr" style={{ fontSize: 16 }}>sync</span>
                Sincronización
              </h4>
              {loading ? (
                <div className="state">Cargando datos de sincronización…</div>
              ) : syncStatus ? (
                <div className="sync-list">
                  <div className="sync-item">
                    <div className="sync-item__info">
                      <span className="sync-item__type">Total</span>
                      <span>{syncStatus.total} registros</span>
                    </div>
                  </div>
                  <div className="sync-item">
                    <div className="sync-item__info">
                      <span className="sync-item__type">Pendientes</span>
                      <span>{syncStatus.pending} registros</span>
                    </div>
                  </div>
                  <div className="sync-item">
                    <div className="sync-item__info">
                      <span className="sync-item__type">Procesados</span>
                      <span>{syncStatus.processed} registros</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="state">No hay datos de sincronización disponibles.</div>
              )}
            </div>

            <div className="license-detail-section">
              <h4>
                <span className="msr" style={{ fontSize: 16 }}>computer</span>
                Datos Técnicos
              </h4>
              <div className="license-info-grid">
                <span className="license-info-label">ID Máquina:</span>
                <span className="license-info-value">{license.machineId ?? '—'}</span>
                <span className="license-info-label">Usuario ERP:</span>
                <span className="license-info-value">{license.erpUserId ?? '—'}</span>
                <span className="license-info-label">Instalación:</span>
                <span className="license-info-value" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                  {license.erpInstanceUrl ?? '—'}
                </span>
                <span className="license-info-label">Creada:</span>
                <span className="license-info-value">{new Date(license.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal__foot">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
