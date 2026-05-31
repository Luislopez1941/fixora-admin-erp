import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import type { PlatformStats, UserRow } from '../lib/types'
import './pages.css'
import './Dashboard.css'

const STAT_META: { key: keyof PlatformStats; label: string; icon: string }[] = [
  { key: 'companies', label: 'Empresas',   icon: 'business' },
  { key: 'users',     label: 'Usuarios',   icon: 'person' },
  { key: 'customers', label: 'Clientes',   icon: 'handshake' },
  { key: 'branches',  label: 'Sucursales', icon: 'store' },
]

const KIND_LABEL: Record<string, string> = {
  SYSTEM:  'Super Admin',
  ACCOUNT: 'Dueño de empresa',
  STAFF:   'Empleado',
}

export default function Dashboard() {
  const navigate = useNavigate()

  const stats = useFetch<PlatformStats>(() => api.get('/platform/stats'))
  const users  = useFetch<UserRow[]>(() => api.get('/platform/users'))

  // Solo mostramos dueños: SYSTEM y ACCOUNT (no STAFF)
  const owners = users.data?.filter((u) => u.userKind !== 'STAFF') ?? []

  return (
    <div>
      {/* KPIs */}
      <div className="stats-grid">
        {STAT_META.map((meta) => (
          <div className="stat-card" key={meta.key}>
            <span className="msr stat-card__icon">{meta.icon}</span>
            <div className="stat-card__label">{meta.label}</div>
            <div className="stat-card__value">
              {stats.loading ? '—' : (stats.data?.[meta.key] ?? 0)}
            </div>
          </div>
        ))}
      </div>

      {stats.error && (
        <div className="state state--error">Backend no disponible: {stats.error}</div>
      )}

      {/* Usuarios dueños */}
      <div className="dash-section">
        <div className="dash-section-head">
          <h2>Usuarios dueños</h2>
          <span className="owner-pill">
            {owners.length} registro{owners.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="panel">
          {users.loading ? (
            <div className="state">Cargando…</div>
          ) : users.error ? (
            <div className="state state--error">{users.error}</div>
          ) : owners.length === 0 ? (
            <div className="state">Sin usuarios registrados.</div>
          ) : (
            <table className="owner-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Tipo</th>
                  <th>Empresas</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {owners.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="owner-cell">
                        <span className="owner-avatar">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div className="owner-name">{u.name}</div>
                          <div className="owner-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="owner-pill">
                        {KIND_LABEL[u.userKind] ?? u.userKind}
                      </span>
                    </td>
                    <td>
                      <span className="owner-pill">
                        {u.companies.length} empresa{u.companies.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.active ? 'badge--ok' : 'badge--off'}`}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-ver"
                        onClick={() => navigate(`/users/${u.id}`)}
                      >
                        Ver <span className="msr">arrow_forward</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
