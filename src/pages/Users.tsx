import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import APIs, { type DeploymentMode } from '../services/APIs'
import { useFetch } from '../lib/useFetch'
import Toast, { type ToastData } from '../components/Toast'
import ConfirmDialog, { type ConfirmDialogData } from '../components/ConfirmDialog'
import NewClientUserModal, { MODE_LABEL } from '../components/NewClientUserModal'
import EditClientUserModal from '../components/EditClientUserModal'
import RetryProvisioningModal from '../components/RetryProvisioningModal'
import './pages.css'
import './UsersActions.css'

export interface ClientUserRow {
  id: number
  email: string
  firstName: string | null
  firstLastName: string | null
  secondLastName: string | null
  phone: string | null
  deploymentMode: DeploymentMode | null
  active: boolean
  createdAt: string
  provisioningError: string | null
  lastProvisionedAt: string | null
  hasDedicatedDatabase: boolean
  licenses: Array<{ id: number; key: string; status: string; expiresAt: string | null }>
}

export default function Users() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<ClientUserRow | null>(null)
  const [retryingUser, setRetryingUser] = useState<ClientUserRow | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData | null>(null)
  const [loadingAction, setLoadingAction] = useState<{ userId: number | 'global'; action: string } | null>(null)
  const { data: response, loading, error, refetch } = useFetch<{ users: ClientUserRow[] }>(() =>
    APIs.getClientUsers<{ users: ClientUserRow[] }>(),
  )

  const handleRunMigration = async () => {
    setLoadingAction({ userId: 'global', action: 'migration' })
    try {
      const res = await APIs.runMigration();
      setToast({
        type: res.success ? 'success' : 'error',
        message: res.message || (res.success ? 'Migración ejecutada correctamente.' : 'Error al ejecutar la migración.'),
      });
    } catch (e: any) {
      setToast({
        type: 'error',
        message: e.response?.data?.message || 'Error inesperado al ejecutar la migración.',
      });
    } finally {
      setLoadingAction(null)
    }
  };

  const handleRunMigrationForUser = async (userId: number) => {
    setConfirmDialog({
      title: 'Ejecutar Migración',
      message: 'Aplica a la base de este cliente las migraciones pendientes del ERP (nuevas tablas y columnas). No borra ni cambia sus datos. Hazlo cuando una actualización del sistema agregue campos nuevos. ¿Continuar?',
      confirmLabel: 'Ejecutar',
      danger: false,
      onConfirm: async () => {
        setConfirmDialog(null)
        setLoadingAction({ userId, action: 'migration' })
        try {
          const res = await APIs.runMigrationForUser(userId)
          setToast({
            type: res.success ? 'success' : 'error',
            message: res.message || (res.success ? 'Migración ejecutada correctamente.' : 'Error al ejecutar la migración.'),
          });
        } catch (e: any) {
          setToast({
            type: 'error',
            message: e.response?.data?.message || 'Error inesperado al ejecutar la migración.',
          });
        } finally {
          setLoadingAction(null)
        }
      },
    })
  }

  const handleDeployMigrationForUser = async (userId: number) => {
    setConfirmDialog({
      title: 'Migrate deploy',
      message: 'Ejecuta "prisma migrate deploy" en la base de este cliente: aplica solo las migraciones versionadas que le falten (tablas y columnas nuevas) y sincroniza el catálogo de permisos. No borra datos. Es la forma recomendada de actualizar un cliente. ¿Continuar?',
      confirmLabel: 'Ejecutar deploy',
      danger: false,
      onConfirm: async () => {
        setConfirmDialog(null)
        setLoadingAction({ userId, action: 'deploy' })
        try {
          const res = await APIs.deployMigrationForUser(userId)
          setToast({
            type: res.success ? 'success' : 'error',
            message: res.message || (res.success ? 'Migraciones aplicadas.' : 'No se pudo ejecutar migrate deploy.'),
          })
        } catch (e: any) {
          setToast({
            type: 'error',
            message: e.response?.data?.message || 'Error inesperado al ejecutar migrate deploy.',
          })
        } finally {
          setLoadingAction(null)
        }
      },
    })
  }

  const handlePushForce = async (userId: number) => {
    setConfirmDialog({
      title: 'DB Push aceptando pérdida de datos',
      message: 'Sincroniza la base de este cliente con el esquema actual (prisma db push --accept-data-loss) y crea la extensión pg_trgm. Borra los datos de las tablas y columnas que desaparecen con la reestructuración. Úsalo solo si su base es de desarrollo o ya está vacía; si tiene datos que quieres conservar usa "SQL con datos". ¿Continuar?',
      confirmLabel: 'Sincronizar (puede borrar datos)',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null)
        setLoadingAction({ userId, action: 'push-force' })
        try {
          const res = await APIs.pushForceForUser(userId)
          setToast({ type: res.success ? 'success' : 'error', message: res.message || (res.success ? 'Esquema sincronizado.' : 'No se pudo sincronizar el esquema.') })
        } catch (e: any) {
          setToast({ type: 'error', message: e.response?.data?.message || 'Error inesperado al sincronizar el esquema.' })
        } finally {
          setLoadingAction(null)
        }
      },
    })
  }

  // Aplica TODAS las migraciones SQL pendientes en orden. Son idempotentes: si la base ya tiene parte de los cambios, se omiten sin error.
  const handleApplySql = async (userId: number) => {
    setConfirmDialog({
      title: 'Aplicar migraciones pendientes',
      message: 'Aplica en orden las migraciones SQL nuevas (cotizaciones, órdenes de venta, devoluciones, tipos y sucursal de clientes, proveedores, kardex y contabilidad). Solo agregan tablas y columnas, conservan los datos y se pueden repetir sin error. Haz un respaldo antes. ¿Continuar?',
      confirmLabel: 'Aplicar migraciones',
      danger: false,
      onConfirm: async () => {
        setConfirmDialog(null)
        setLoadingAction({ userId, action: 'apply-sql' })
        try {
          const res = await APIs.applyPendingMigrationsForUser(userId)
          setToast({ type: res.success ? 'success' : 'error', message: res.message || (res.success ? 'Migraciones aplicadas.' : 'No se pudo aplicar la migración.') })
        } catch (e: any) {
          setToast({ type: 'error', message: e.response?.data?.message || 'Error inesperado al aplicar las migraciones.' })
        } finally {
          setLoadingAction(null)
        }
      },
    })
  }

  const handleResetDatabase = async (userId: number) => {
    setConfirmDialog({
      title: 'Resetear Base de Datos',
      message: 'ESTA ACCIÓN ES IRREVERSIBLE. Se eliminarán todos los datos del cliente y se recreará el esquema de la base de datos. ¿Estás seguro de que deseas continuar?',
      confirmLabel: 'Resetear Ahora',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog(null)
        setLoadingAction({ userId, action: 'reset' })
        try {
          const res = await APIs.resetDatabase(userId)
          setToast({
            type: res.success ? 'success' : 'error',
            message: res.message || (res.success ? 'Base de datos reseteada correctamente.' : 'Error al resetear la base de datos.'),
          });
        } catch (e: any) {
          setToast({
            type: 'error',
            message: e.response?.data?.message || 'Error inesperado al resetear la base de datos.',
          });
        } finally {
          setLoadingAction(null)
        }
      },
    })
  }

  const handleSyncUser = async (u: ClientUserRow) => {
    setConfirmDialog({
      title: 'Sincronizar Usuario',
      message: 'Deja al cliente listo para trabajar: crea o ajusta su usuario dueño, su empresa, su sucursal, activa los módulos de su licencia y siembra los datos por defecto. Se puede repetir sin duplicar nada. ¿Continuar?',
      confirmLabel: 'Sincronizar',
      danger: false,
      onConfirm: async () => {
        setConfirmDialog(null)
        setLoadingAction({ userId: u.id, action: 'sync' })
        try {
          const response = await APIs.syncUser(u.id, {
            email: u.email,
            firstName: u.firstName || '',
            firstLastName: u.firstLastName || '',
            secondLastName: u.secondLastName || '',
            phone: u.phone || '',
          })
          if (response.success) {
            setToast({ type: 'success', message: response.message || 'Usuario sincronizado correctamente.' })
          } else {
            setToast({ type: 'error', message: response.message || 'Error al sincronizar usuario.' })
          }
        } catch (err: any) {
          setToast({ type: 'error', message: err.response?.data?.message || err.message || 'No se pudo sincronizar el usuario.' })
        } finally {
          setLoadingAction(null)
        }
      },
    })
  }

  const handleSeed = (userId: number | undefined) => {
    if (!userId) {
      setToast({ type: 'error', message: 'ID de usuario no válido.' });
      return;
    }
    setConfirmDialog({
      title: 'Ejecutar Seed de Datos',
      message: 'Esto sembrará los datos por defecto (áreas, métodos de pago, almacén principal) en la base de datos del cliente. ¿Deseas continuar?',
      confirmLabel: 'Ejecutar',
      danger: false,
      onConfirm: async () => {
        setConfirmDialog(null)
        setLoadingAction({ userId, action: 'seed' })
        try {
          const response = await APIs.seedTenantByUserId(userId)
          if (response.status === 'success' || response.success) {
            setToast({ type: 'success', message: response.message || 'Datos sembrados correctamente.' })
          } else {
            setToast({ type: 'error', message: 'Error al ejecutar el seed.' })
          }
        } catch (err: any) {
          setToast({ type: 'error', message: err.response?.data?.message || err.message || 'No se pudo ejecutar el seed.' })
        } finally {
          setLoadingAction(null)
        }
      },
    })
  }

  const handleSeedGrocery = (userId: number | undefined) => {
    if (!userId) {
      setToast({ type: 'error', message: 'ID de usuario no válido.' })
      return
    }
    setConfirmDialog({
      title: 'Ejecutar Seed 2 (abarrotes)',
      message: 'Esto carga un catálogo demo de abarrotes en la base del cliente: unidades, almacenes, áreas, familias y categorías, unos 4000 artículos con rangos de precio (sin almacén ni existencias asignados). No duplica lo que ya exista (se puede repetir). Úsalo en bases de prueba. ¿Continuar?',
      confirmLabel: 'Ejecutar seed 2',
      danger: false,
      onConfirm: async () => {
        setConfirmDialog(null)
        setLoadingAction({ userId, action: 'seed2' })
        try {
          const response = await APIs.seedGroceryDemo(userId)
          if (response.status === 'success' || response.success) {
            setToast({ type: 'success', message: response.message || 'Seed 2 ejecutado correctamente.' })
          } else {
            setToast({ type: 'error', message: response.message || 'Error al ejecutar el seed 2.' })
          }
        } catch (err: any) {
          setToast({ type: 'error', message: err.response?.data?.message || err.message || 'No se pudo ejecutar el seed 2.' })
        } finally {
          setLoadingAction(null)
        }
      },
    })
  }

  const data = response?.users ?? null

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirmDialog && <ConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(null)} />}

      <div className="page-head">
        <h1>Usuarios</h1>
        <p>Cuentas de clientes — login y en qué entorno vive cada una. Las licencias se asignan aparte.</p>
      </div>

      <div className="panel">
        <div className="panel__head">
          <h2>{data ? `${data.length} usuarios` : 'Usuarios'}</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn-primary"
              onClick={handleRunMigration}
              disabled={loadingAction?.action === 'migration' && loadingAction?.userId === 'global'}
            >
              <span className={`msr ${loadingAction?.action === 'migration' && loadingAction?.userId === 'global' ? 'rotating' : ''}`} style={{ fontSize: 18 }}>sync</span>
              {loadingAction?.action === 'migration' && loadingAction?.userId === 'global' ? 'Migrando...' : 'Ejecutar Migración'}
            </button>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <span className="msr" style={{ fontSize: 18 }}>person_add</span>
              Nuevo usuario
            </button>
          </div>
        </div>

        {loading ? (
          <div className="state">Cargando…</div>
        ) : error ? (
          <div className="state state--error">{error}</div>
        ) : !data?.length ? (
          <div className="state">Aún no hay usuarios. Crea el primero con "Nuevo usuario".</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Entorno</th>
                <th>Licencias</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id}>
                  <td className="with-avatar">
                    <span className="avatar">{(u.firstName || 'U').charAt(0).toUpperCase()}</span>
                    <div>
                      <div className="cell-title">{u.firstName || ''} {u.firstLastName || ''} {u.secondLastName || ''}</div>
                      <div className="cell-sub">{u.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge--mode-${u.deploymentMode?.toLowerCase() || 'unknown'}`}>
                      {u.deploymentMode ? MODE_LABEL[u.deploymentMode] : 'No definido'}
                    </span>
                  </td>
                  <td className="cell-sub">
                    {u.licenses.length ? `${u.licenses.length} licencia(s)` : 'Ninguna todavía'}
                  </td>
                  <td>
                    {u.provisioningError ? (
                      <span className="badge badge--blocked" title={u.provisioningError}>
                        <span className="msr" style={{ fontSize: 14 }}>error</span>
                        Error al configurar
                      </span>
                    ) : u.hasDedicatedDatabase && !u.lastProvisionedAt ? (
                      <span className="badge badge--expired" title="Todavía no se ha confirmado que su base esté lista">
                        <span className="msr" style={{ fontSize: 14 }}>hourglass_empty</span>
                        Sin configurar
                      </span>
                    ) : (
                      <span className={`badge ${u.active ? 'badge--ok' : 'badge--off'}`}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    )}
                  </td>
                  <td>
                    {u.hasDedicatedDatabase && (u.provisioningError || !u.lastProvisionedAt) && (
                      <button
                        className="icon-btn"
                        title={u.provisioningError ? 'Reintentar configuración' : 'Configurar ahora'}
                        onClick={() => setRetryingUser(u)}
                      >
                        <span className="msr" style={{ fontSize: 18 }}>refresh</span>
                      </button>
                    )}
                    <div className="user-actions">
                    <button
                      className="user-action"
                      title="Migrate deploy: aplica las migraciones versionadas que falten en su base y sincroniza permisos. No borra datos. Recomendado."
                      onClick={() => handleDeployMigrationForUser(u.id)}
                      disabled={loadingAction?.userId === u.id && loadingAction?.action === 'deploy'}
                    >
                      <span className={`msr ${loadingAction?.userId === u.id && loadingAction?.action === 'deploy' ? 'rotating' : ''}`}>rocket_launch</span>
                      Deploy
                    </button>
                    <button
                      className="user-action"
                      title="DB Push: sincroniza su base con el esquema actual (prisma db push), sin historial de migraciones. Úsalo si su base se creó así o si Deploy falla por falta de historial."
                      onClick={() => handleRunMigrationForUser(u.id)}
                      disabled={loadingAction?.userId === u.id && loadingAction?.action === 'migration'}
                    >
                      <span className={`msr ${loadingAction?.userId === u.id && loadingAction?.action === 'migration' ? 'rotating' : ''}`}>sync</span>
                      DB Push
                    </button>
                    <button
                      className="user-action"
                      title="Aplica en orden las migraciones SQL pendientes (solo agregan tablas y columnas; se pueden repetir). Haz respaldo antes."
                      onClick={() => handleApplySql(u.id)}
                      disabled={loadingAction?.userId === u.id && loadingAction?.action === 'apply-sql'}
                    >
                      <span className={`msr ${loadingAction?.userId === u.id && loadingAction?.action === 'apply-sql' ? 'rotating' : ''}`}>database_upload</span>
                      Migraciones SQL
                    </button>
                    <button
                      className="user-action user-action--danger"
                      title="DB Push forzado: sincroniza el esquema aceptando pérdida de datos y crea pg_trgm. Solo para bases de desarrollo o ya vaciadas."
                      onClick={() => handlePushForce(u.id)}
                      disabled={loadingAction?.userId === u.id && loadingAction?.action === 'push-force'}
                    >
                      <span className={`msr ${loadingAction?.userId === u.id && loadingAction?.action === 'push-force' ? 'rotating' : ''}`}>bolt</span>
                      DB Push forzado
                    </button>
                    <button
                      className="user-action"
                      title="Sincronizar y configurar: crea o ajusta su usuario dueño, empresa y sucursal, activa los módulos de su licencia y siembra datos por defecto."
                      onClick={() => handleSyncUser(u)}
                      disabled={loadingAction?.userId === u.id && loadingAction?.action === 'sync'}
                    >
                      <span className={`msr ${loadingAction?.userId === u.id && loadingAction?.action === 'sync' ? 'rotating' : ''}`}>person_add</span>
                      Sincronizar
                    </button>
                    <button
                      className="user-action"
                      title="Sembrar datos por defecto: crea áreas, métodos de pago, almacén y series que falten, sin duplicar."
                      onClick={() => handleSeed(u.id)}
                      disabled={loadingAction?.userId === u.id && loadingAction?.action === 'seed'}
                    >
                      <span className={`msr ${loadingAction?.userId === u.id && loadingAction?.action === 'seed' ? 'rotating' : ''}`}>database</span>
                      Datos
                    </button>
                    <button
                      className="user-action"
                      title="Seed 2: carga un catálogo demo de abarrotes (unos 4000 artículos con unidades, almacenes, áreas, categorías y rangos de precio; sin existencias). No duplica; se puede repetir."
                      onClick={() => handleSeedGrocery(u.id)}
                      disabled={loadingAction?.userId === u.id && loadingAction?.action === 'seed2'}
                    >
                      <span className={`msr ${loadingAction?.userId === u.id && loadingAction?.action === 'seed2' ? 'rotating' : ''}`}>shopping_basket</span>
                      Seed 2
                    </button>
                    <button
                      className="user-action user-action--danger"
                      title="Resetear base de datos: borra todos sus datos y recrea el esquema. Irreversible."
                      onClick={() => handleResetDatabase(u.id)}
                      disabled={loadingAction?.userId === u.id && loadingAction?.action === 'reset'}
                    >
                      <span className={`msr ${loadingAction?.userId === u.id && loadingAction?.action === 'reset' ? 'rotating' : ''}`}>restart_alt</span>
                      Resetear
                    </button>
                    <button
                      className="icon-btn"
                      title="Ver empresas, módulos y licencias"
                      onClick={() => navigate(`/users/${u.id}`)}
                    >
                      <span className="msr" style={{ fontSize: 18 }}>visibility</span>
                    </button>
                    <button
                      className="icon-btn"
                      title="Editar usuario"
                      onClick={() => setEditingUser(u)}
                    >
                      <span className="msr" style={{ fontSize: 18 }}>edit</span>
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <NewClientUserModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => {
          setShowModal(false)
          refetch()
          setToast({ type: 'success', message: 'Usuario creado.' })
        }}
      />

      <EditClientUserModal
        key={`edit-${editingUser?.id}`}
        open={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdated={() => {
          setEditingUser(null)
          refetch()
          setToast({ type: 'success', message: 'Cambios guardados.' })
        }}
      />

      <RetryProvisioningModal
        key={`retry-${retryingUser?.id}`}
        open={!!retryingUser}
        user={retryingUser}
        onClose={() => setRetryingUser(null)}
        onRetried={() => {
          setRetryingUser(null)
          refetch()
          setToast({ type: 'success', message: 'Configuración reintentada.' })
        }}
      />
    </div>
  )
}
