import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useFetch } from '../lib/useFetch'
import type { ModulePricingRow } from '../lib/types'
import './pages.css'
import './ModulePricing.css'

const MOD_ICON: Record<string, string> = {
  dashboard:      'dashboard',
  sales:          'sell',
  cobranza:       'payments',
  shopping:       'shopping_cart',
  'cash-register':'point_of_sale',
  production:     'precision_manufacturing',
  store:          'warehouse',
  catalogos:      'category',
  reports:        'analytics',
  income:         'trending_up',
  users:          'group',
  configurations: 'settings',
}

const CURRENCIES = ['MXN', 'USD', 'EUR']

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(n)

export default function ModulePricing() {
  const { data: remote, loading, error } = useFetch<ModulePricingRow[]>(
    () => api.get('/platform/modules/pricing'),
  )

  const [rows, setRows] = useState<ModulePricingRow[]>([])
  const [currency, setCurrency] = useState('MXN')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (remote) {
      setRows(remote.map(r => ({ ...r })))
      if (remote[0]?.currency) setCurrency(remote[0].currency)
    }
  }, [remote])

  const setPrice = (idx: number, field: 'priceMonthly' | 'priceAnnual', val: string) => {
    const num = parseFloat(val) || 0
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: num } : r))
    setDirty(true)
    setMsg(null)
  }

  const handleCurrencyChange = (c: string) => {
    setCurrency(c)
    setRows(prev => prev.map(r => ({ ...r, currency: c })))
    setDirty(true)
  }

  const reset = () => {
    if (remote) setRows(remote.map(r => ({ ...r })))
    setDirty(false)
    setMsg(null)
  }

  const save = async () => {
    setSaving(true)
    setMsg(null)
    try {
      await api.put('/platform/modules/pricing', {
        modules: rows.map(r => ({
          moduleId:     r.moduleId,
          priceMonthly: r.priceMonthly,
          priceAnnual:  r.priceAnnual,
          currency,
        })),
      })
      setMsg({ ok: true, text: 'Precios guardados correctamente.' })
      setDirty(false)
    } catch (e: any) {
      setMsg({ ok: false, text: e.message ?? 'Error al guardar.' })
    } finally {
      setSaving(false)
    }
  }

  const totalMonthly = rows.reduce((s, r) => s + r.priceMonthly, 0)
  const totalAnnual  = rows.reduce((s, r) => s + r.priceAnnual,  0)
  const maxMonthly   = Math.max(...rows.map(r => r.priceMonthly), 0)

  return (
    <div className="mp-page">

      {/* Cabecera */}
      <div className="mp-head">
        <div className="mp-head-text">
          <h1>Precios de módulos</h1>
          <p>Define cuánto cobra el sistema a cada empresa por módulo activo. Mensual o anual.</p>
        </div>
        <div className="mp-currency-row">
          <span className="msr" style={{ fontSize: 16 }}>attach_money</span>
          Moneda:
          <select
            className="mp-currency-select"
            value={currency}
            onChange={e => handleCurrencyChange(e.target.value)}
          >
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Cards resumen */}
      <div className="mp-summary">
        <div className="mp-summary-card">
          <div className="mp-summary-label">Total si empresa activa todo (mensual)</div>
          <div className="mp-summary-value">{fmt(totalMonthly, currency)}</div>
          <div className="mp-summary-sub">{rows.length} módulos</div>
        </div>
        <div className="mp-summary-card">
          <div className="mp-summary-label">Total si empresa activa todo (anual)</div>
          <div className="mp-summary-value">{fmt(totalAnnual, currency)}</div>
          <div className="mp-summary-sub">{fmt(totalAnnual / 12, currency)} / mes promedio</div>
        </div>
        <div className="mp-summary-card">
          <div className="mp-summary-label">Módulo más caro (mensual)</div>
          <div className="mp-summary-value">{fmt(maxMonthly, currency)}</div>
          <div className="mp-summary-sub">
            {rows.find(r => r.priceMonthly === maxMonthly)?.name ?? '—'}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="panel">
        {loading ? (
          <div className="state">Cargando módulos…</div>
        ) : error ? (
          <div className="state state--error">{error}</div>
        ) : (
          <table className="mp-table">
            <thead>
              <tr>
                <th>Módulo</th>
                <th className="right">Precio mensual</th>
                <th className="right">Precio anual</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.moduleId}>
                  <td>
                    <div className="mp-mod-cell">
                      <span className="msr mp-mod-icon">
                        {MOD_ICON[row.moduleId] ?? 'extension'}
                      </span>
                      <div>
                        <div className="mp-mod-name">{row.name}</div>
                        {row.description && (
                          <div className="mp-mod-desc">{row.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="mp-price-cell">
                    <div className="mp-price-wrap">
                      <span className="mp-price-symbol">$</span>
                      <input
                        className="mp-price-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.priceMonthly === 0 ? '' : row.priceMonthly}
                        placeholder="0.00"
                        onChange={e => setPrice(idx, 'priceMonthly', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="mp-price-cell">
                    <div className="mp-price-wrap">
                      <span className="mp-price-symbol">$</span>
                      <input
                        className="mp-price-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.priceAnnual === 0 ? '' : row.priceAnnual}
                        placeholder="0.00"
                        onChange={e => setPrice(idx, 'priceAnnual', e.target.value)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Barra de guardado */}
      {!loading && (
        <div className="mp-save-bar">
          {msg ? (
            <div className={`mp-msg ${msg.ok ? 'mp-msg--ok' : 'mp-msg--err'}`}>
              <span className="msr" style={{ fontSize: 15 }}>
                {msg.ok ? 'check_circle' : 'error'}
              </span>
              {msg.text}
            </div>
          ) : (
            <span className="mp-save-info">
              {dirty
                ? <><span className="msr" style={{ fontSize: 15 }}>edit</span> Tienes cambios sin guardar</>
                : <><span className="msr" style={{ fontSize: 15 }}>check_circle</span> Sin cambios pendientes</>
              }
            </span>
          )}
          <div className="mp-save-actions">
            <button className="mp-btn-reset" onClick={reset} disabled={!dirty || saving}>
              Descartar
            </button>
            <button className="mp-btn-save" onClick={save} disabled={!dirty || saving}>
              {saving
                ? <><span className="msr mp-spin" style={{ fontSize: 15 }}>progress_activity</span> Guardando…</>
                : <><span className="msr" style={{ fontSize: 15 }}>save</span> Guardar precios</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
