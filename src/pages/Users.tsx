import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import type { UserRow } from '../lib/types'
import './pages.css'

const KIND_BADGE: Record<UserRow['userKind'], { cls: string; label: string }> = {
  SYSTEM: { cls: 'badge--system', label: 'Dueño' },
  ACCOUNT: { cls: 'badge--account', label: 'Admin empresa' },
  STAFF: { cls: 'badge--staff', label: 'Empleado' },
}

export default function Users() {
  const navigate = useNavigate()
  const { data, loading, error } = useFetch<UserRow[]>(() =>
    api.get('/platform/users'),
  )

  return (
    <div>
      <div className="page-head">
        <h1>Usuarios</h1>
        <p>Todos los usuarios del sistema, de todas las empresas.</p>
      </div>

      <div className="panel">
        <div className="panel__head">
          <h2>{data ? `${data.length} usuarios` : 'Usuarios'}</h2>
        </div>

        {loading ? (
          <div className="state">Cargando…</div>
        ) : error ? (
          <div className="state state--error">{error}</div>
        ) : !data?.length ? (
          <div className="state">Aún no hay usuarios.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Rol</th>
                <th>Empresas</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => {
                const badge = KIND_BADGE[u.userKind] ?? KIND_BADGE.STAFF
                return (
                  <tr key={u.id}>
                    <td className="with-avatar">
                      <span className="avatar">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <div className="cell-title">{u.name}</div>
                        <div className="cell-sub">{u.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${badge.cls}`}>{badge.label}</span>
                    </td>
                    <td className="cell-sub">{u.role ?? '—'}</td>
                    <td className="cell-sub">
                      {u.companies.map((c) => c.name).join(', ') || '—'}
                    </td>
                    <td>
                      <span
                        className={`badge ${u.active ? 'badge--ok' : 'badge--off'}`}
                      >
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-action"
                        onClick={() => navigate(`/users/${u.id}`)}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
