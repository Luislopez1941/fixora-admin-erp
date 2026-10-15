import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import APIs from '../services/APIs'
import { useFetch } from '../lib/useFetch'
import type { CompanyRow } from '../lib/types'
import './pages.css'
import './Companies.css'

export default function Companies() {
  const navigate = useNavigate()
  const [editingCompany, setEditingCompany] = useState<CompanyRow | null>(null)
  const [editForm, setEditForm] = useState({ name: '', businessName: '', taxId: '' })
  const [deletingId, setDeletingId] = useState<{ clientUserId: number; id: number } | null>(null)

  const { data, loading, error, refetch } = useFetch<CompanyRow[]>(() =>
    APIs.getCompanies<CompanyRow[]>(),
  )

  const handleEditClick = (c: CompanyRow) => {
    setEditingCompany(c)
    setEditForm({ name: c.name, businessName: c.businessName, taxId: c.taxId ?? '' })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCompany) return

    if (!editForm.name.trim() || !editForm.businessName.trim()) {
      alert('⚠️ Por favor, completa el nombre y nombre comercial.')
      return
    }

    try {
      await APIs.updateCompany(editingCompany.clientUserId, editingCompany.id, editForm)
      setEditingCompany(null)
      refetch()
      alert('✅ Empresa actualizada correctamente')
    } catch (err: any) {
      alert(`⚠️ WARNING: ${err.message || 'Error al actualizar empresa'}`)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    if (!confirm('¿Estás seguro de que deseas eliminar esta empresa? Esta acción es irreversible.')) return
    try {
      await APIs.deleteCompany(deletingId.clientUserId, deletingId.id)
      setDeletingId(null)
      refetch()
    } catch (err) {
      alert('Error al eliminar empresa')
    }
  }

  return (
    <div className="companies-page">
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
                <th>Cliente</th>
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
                <tr key={`${c.clientUserId}-${c.id}`}>
                  <td className="with-avatar">
                    <span className="avatar">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="cell-title">{c.name}</div>
                      <div className="cell-sub">{c.businessName}</div>
                    </div>
                  </td>
                  <td className="cell-sub">{c.ownerEmail}</td>
                  <td className="cell-sub">{c.taxId ?? '—'}</td>
                  <td>{c.branchesCount}</td>
                  <td>{c.usersCount}</td>
                  <td>{c.customersCount}</td>
                  <td>{c.salesCount}</td>
                  <td className="cell-sub">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-action"
                      onClick={() => navigate(`/companies/${c.id}/modules`)}
                      title="Ver y editar módulos"
                    >
                      <span className="msr" style={{ fontSize: 15 }}>extension</span> Módulos
                    </button>
                    <button
                      className="btn-action"
                      onClick={() => handleEditClick(c)}
                      title="Editar empresa"
                    >
                      <span className="msr" style={{ fontSize: 15 }}>edit</span> Editar
                    </button>
                    <button
                      className="btn-action btn-action--danger"
                      onClick={() => setDeletingId({ clientUserId: c.clientUserId, id: c.id })}
                      title="Eliminar empresa"
                    >
                      <span className="msr" style={{ fontSize: 15 }}>delete</span> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingCompany && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__head">
              <h2>Editar Empresa</h2>
              <button className="btn-close" onClick={() => setEditingCompany(null)}>×</button>
            </div>
            <form onSubmit={handleUpdate} className="modal__body">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nombre Comercial</label>
                <input
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>RFC / Tax ID</label>
                <input
                  value={editForm.taxId}
                  onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })}
                />
              </div>
              <div className="modal__footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingCompany(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="modal-overlay">
          <div className="modal modal--confirm">
            <div className="modal__body">
              <h3>Confirmar Eliminación</h3>
              <p>¿Estás seguro de que deseas eliminar la empresa <strong>{data?.find(c => c.id === deletingId.id)?.name}</strong>?</p>
              <p className="warning">Esta acción eliminará todas las sucursales y datos asociados.</p>
              <div className="modal__footer">
                <button className="btn-secondary" onClick={() => setDeletingId(null)}>
                  Cancelar
                </button>
                <button className="btn-danger" onClick={handleDelete}>
                  Eliminar Definitivamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
