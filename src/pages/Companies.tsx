import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import type { CompanyRow } from '../lib/types'
import './pages.css'
import './Companies.css'

export default function Companies() {
  const navigate = useNavigate()
  const { data, loading, error } = useFetch<CompanyRow[]>(() =>
    api.get('/platform/companies'),
  )

  return (
    <div>
      <div className="page-head">
        <h1>Empresas</h1>
        <p>Todas las empresas (tus clientes) registradas en el sistema.</p>
      </div>

      <div className="panel">
        <div className="panel__head">
          <h2>{data ? `${data.length} empresas` : 'Empresas'}</h2>
        </div>

        {loading ? (
          <div className="state">Cargando…</div>
        ) : error ? (
          <div className="state state--error">{error}</div>
        ) : !data?.length ? (
          <div className="state">Aún no hay empresas registradas.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>RFC</th>
                <th>Sucursales</th>
                <th>Usuarios</th>
                <th>Clientes</th>
                <th>Ventas</th>
                <th>Alta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td className="with-avatar">
                    <span className="avatar">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="cell-title">{c.name}</div>
                      <div className="cell-sub">{c.businessName}</div>
                    </div>
                  </td>
                  <td className="cell-sub">{c.taxId ?? '—'}</td>
                  <td>{c.branchesCount}</td>
                  <td>{c.usersCount}</td>
                  <td>{c.customersCount}</td>
                  <td>{c.salesCount}</td>
                  <td className="cell-sub">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="btn-action"
                      onClick={() => navigate(`/companies/${c.id}/modules`)}
                      title="Ver y editar módulos"
                    >
                      <span className="msr" style={{ fontSize: 15 }}>extension</span> Módulos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
