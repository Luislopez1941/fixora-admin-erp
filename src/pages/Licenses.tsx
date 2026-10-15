import { useState, useMemo } from 'react'
import APIs, { type DeploymentMode } from '../services/APIs'
import { useFetch } from '../lib/useFetch'
import Toast, { type ToastData } from '../components/Toast'
import ConfirmDialog, { type ConfirmDialogData } from '../components/ConfirmDialog'
import NewLicenseModal, { MODE_LABEL } from '../components/NewLicenseModal'
import EditLicenseModal from '../components/EditLicenseModal'
import LicenseDetailsModal from '../components/LicenseDetailsModal'
import './pages.css'
import './Licenses.css'

interface License {
  id: number
  key: string
  type: string
  status: 'active' | 'blocked' | 'expired'
  deploymentMode: DeploymentMode
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

export default function Licenses() {
  const [showModal, setShowModal] = useState(false)
  const [editLicense, setEditLicense] = useState<License | null>(null)
  const [detailsLicense, setDetailsLicense] = useState<License | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | License['status']>('all')
  const [modeFilter, setModeFilter] = useState<'all' | DeploymentMode>('all')
  const [toast, setToast] = useState<ToastData | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData | null>(null)

  const { data: response, loading, error, refetch } = useFetch<{ success: boolean; licenses: License[] }>(() =>
    APIs.getAllLicenses<{ success: boolean; licenses: License[] }>(),
  )

  const data = response?.licenses ?? null

  const handleBlock = (key: string, currentStatus: string) => {
    const blocking = currentStatus !== 'blocked'

    setConfirmDialog({
      title: blocking ? 'Bloquear licencia' : 'Desbloquear licencia',
      message: blocking
        ? `La instalación con la clave ${key} dejará de poder validarse hasta que la desbloquees.`
        : `La licencia ${key} volverá a quedar activa y podrá validarse con normalidad.`,
      confirmLabel: blocking ? 'Bloquear' : 'Desbloquear',
      danger: blocking,
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          if (blocking) {
            await APIs.blockLicense(key)
            setToast({ type: 'success', message: `Licencia ${key} bloqueada.` })
          } else {
            await APIs.unblockLicense(key)
            setToast({ type: 'success', message: `Licencia ${key} desbloqueada.` })
          }
          refetch()
        } catch (err: any) {
          setToast({ type: 'error', message: err.message || 'No se pudo actualizar la licencia.' })
        }
      },
    })
  }

  const handleDelete = (key: string) => {
    setConfirmDialog({
      title: 'Eliminar licencia permanentemente',
      message: `Esto borra la licencia ${key} y todo su historial de sincronización. No se puede deshacer. (El usuario/empresa que ya se haya creado en el ERP no se ve afectado.)`,
      confirmLabel: 'Eliminar',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          await APIs.deleteLicense(key)
          setToast({ type: 'success', message: `Licencia ${key} eliminada.` })
          refetch()
        } catch (err: any) {
          setToast({ type: 'error', message: err.message || 'No se pudo eliminar la licencia.' })
        }
      },
    })
  }

  const handleDownload = async (licenseKey: string) => {
    try {
      const blob = await APIs.downloadOfflineLicense(licenseKey)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${licenseKey}.lic`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'No se pudo descargar el archivo de licencia.' })
    }
  }

  const handleSeed = async (userId: number) => {
    setConfirmDialog({
      title: 'Ejecutar Seed de Datos',
      message: 'Esto sembrará los datos por defecto (áreas, métodos de pago, almacén principal) en la base de datos del cliente. ¿Deseas continuar?',
      confirmLabel: 'Ejecutar',
      danger: false,
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          const response = await APIs.seedTenantByUserId(userId)
          if (response.status === 'success') {
            setToast({ type: 'success', message: response.message || 'Datos sembrados correctamente.' })
          } else {
            setToast({ type: 'error', message: 'Error al ejecutar el seed.' })
          }
        } catch (err: any) {
          setToast({ type: 'error', message: err.message || 'No se pudo ejecutar el seed.' })
        }
      },
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge--active"><span className="badge--dot" /> Activa</span>
      case 'blocked':
        return <span className="badge badge--blocked"><span className="badge--dot" /> Bloqueada</span>
      case 'expired':
        return <span className="badge badge--expired"><span className="badge--dot" /> Expirada</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  const activeCount = data?.filter(l => l.status === 'active').length ?? 0
  const blockedCount = data?.filter(l => l.status === 'blocked').length ?? 0
  const expiredCount = data?.filter(l => l.status === 'expired').length ?? 0

  const filteredData = useMemo(() => {
    if (!data) return data
    const term = search.trim().toLowerCase()
    return data.filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false
      if (modeFilter !== 'all' && l.deploymentMode !== modeFilter) return false
      if (!term) return true
      const ownerName = l.clientUser ? `${l.clientUser.firstName} ${l.clientUser.firstLastName}` : ''
      return (
        l.key.toLowerCase().includes(term) ||
        (l.companyName ?? '').toLowerCase().includes(term) ||
        ownerName.toLowerCase().includes(term) ||
        (l.clientUser?.email ?? '').toLowerCase().includes(term)
      )
    })
  }, [data, search, statusFilter, modeFilter])

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirmDialog && <ConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(null)} />}

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card stat-card--accent">
          <div className="stat-card__value">{data?.length ?? 0}</div>
          <div className="stat-card__label">Total licencias</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: '#16a34a' }}>{activeCount}</div>
          <div className="stat-card__label">Activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: '#dc2626' }}>{blockedCount}</div>
          <div className="stat-card__label">Bloqueadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: '#92400e' }}>{expiredCount}</div>
          <div className="stat-card__label">Expiradas</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="licenses-toolbar">
        <div className="licenses-search">
          <span className="msr" style={{ fontSize: 18 }}>search</span>
          <input
            type="text"
            placeholder="Buscar por clave, empresa, dueño o email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="licenses-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="blocked">Bloqueadas</option>
          <option value="expired">Expiradas</option>
        </select>

        <select
          className="licenses-filter"
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value as typeof modeFilter)}
        >
          <option value="all">Todos los modos</option>
          <option value="CLOUD">Nube</option>
          <option value="LOCAL">Local</option>
          <option value="HYBRID">Híbrido</option>
          <option value="OFFLINE">Offline</option>
        </select>

        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <span className="msr" style={{ fontSize: 18 }}>add</span>
          Nueva licencia
        </button>
      </div>

      {/* Tabla */}
      <div className="panel">
        <div className="panel__head">
          <h2>
            {filteredData
              ? `${filteredData.length} licencias${filteredData.length !== data?.length ? ` de ${data?.length}` : ''}`
              : 'Licencias'}
          </h2>
        </div>

        {loading ? (
          <div className="state">Cargando…</div>
        ) : error ? (
          <div className="state state--error">{error}</div>
        ) : !data?.length ? (
          <div className="state">Aún no hay licencias creadas.</div>
        ) : !filteredData?.length ? (
          <div className="state">Ninguna licencia coincide con el filtro.</div>
        ) : (
          <table className="table licenses-table">
            <thead>
              <tr>
                <th>Clave</th>
                <th>Empresa</th>
                <th>Dueño</th>
                <th>Modo</th>
                <th>Estado</th>
                <th>Activación</th>
                <th>Última validación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((license) => (
                <tr key={license.id}>
                  <td>
                    <span className="cell-key">{license.key}</span>
                  </td>
                  <td>
                    <div className="cell-company">{license.companyName ?? '—'}</div>
                    <div className="cell-owner">{license.branchName ?? ''}</div>
                  </td>
                  <td>
                    <div>{license.clientUser ? `${license.clientUser.firstName} ${license.clientUser.firstLastName}` : '—'}</div>
                    <div className="cell-owner">{license.clientUser?.email ?? ''}</div>
                  </td>
                  <td>
                    <span className={`badge badge--mode-${license.deploymentMode.toLowerCase()}`}>
                      {MODE_LABEL[license.deploymentMode]}
                    </span>
                  </td>
                  <td>{getStatusBadge(license.status)}</td>
                  <td className="cell-sub">
                    {license.activatedAt
                      ? new Date(license.activatedAt).toLocaleDateString()
                      : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          Sin activar
                          <button
                            className="btn-icon"
                            style={{ width: '24px', height: '24px', padding: 0 }}
                            onClick={() => handleSeed(license.clientUser!.id)}
                            title="Ejecutar Seed de Datos"
                          >
                            <span className="msr" style={{ fontSize: '14px' }}>database</span>
                          </button>
                        </div>
                      )}
                  </td>
                  <td className="cell-sub">
                    {license.lastValidated
                      ? new Date(license.lastValidated).toLocaleDateString()
                      : '—'}
                  </td>
                  <td>
                    <div className="actions-row">
                      <button
                        className="btn-icon"
                        onClick={() => setDetailsLicense(license)}
                        title="Ver detalles y sincronización"
                      >
                        <span className="msr" style={{ fontSize: 16 }}>info</span>
                      </button>
                      <button
                        className={`btn-icon ${license.status === 'blocked' ? 'btn-icon--success' : 'btn-icon--danger'}`}
                        onClick={() => handleBlock(license.key, license.status)}
                        title={license.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                      >
                        <span className="msr" style={{ fontSize: 16 }}>
                          {license.status === 'blocked' ? 'lock_open' : 'block'}
                        </span>
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => setEditLicense(license)}
                        title="Ver y editar (módulos, límites, facturación)"
                      >
                        <span className="msr" style={{ fontSize: 16 }}>edit</span>
                      </button>
                      {license.deploymentMode === 'OFFLINE' && (
                        <button
                          className="btn-icon"
                          onClick={() => handleDownload(license.key)}
                          title="Descargar archivo de licencia (.lic)"
                        >
                          <span className="msr" style={{ fontSize: 16 }}>download</span>
                        </button>
                      )}
                      <button
                        className="btn-icon btn-icon--danger"
                        onClick={() => handleDelete(license.key)}
                        title="Eliminar permanentemente"
                      >
                        <span className="msr" style={{ fontSize: 16 }}>delete_forever</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <NewLicenseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={(key) => {
          refetch()
          setToast({ type: 'success', message: `Licencia creada: ${key}` })
        }}
      />

      <EditLicenseModal
        license={editLicense}
        onClose={() => {
          setEditLicense(null)
          refetch()
        }}
        onSaved={() => {
          refetch()
          setToast({ type: 'success', message: 'Cambios guardados.' })
        }}
      />

      <LicenseDetailsModal
        license={detailsLicense}
        isOpen={!!detailsLicense}
        onClose={() => setDetailsLicense(null)}
      />
    </div>
  )
}
