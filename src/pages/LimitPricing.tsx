import { useState, useEffect } from 'react'
import APIs from '../services/APIs'
import { useFetch } from '../lib/useFetch'
import './pages.css'
import './ModulePricing.css'
import './LimitPricing.css'

interface LimitPricingRow {
  kind: string
  includedFree: number
  priceMonthly: number
  priceAnnual: number
  currency: string
}

const LABELS: Record<string, { name: string; icon: string; unit: string }> = {
  companies: { name: 'Empresas', icon: 'apartment', unit: 'empresa' },
  branches: { name: 'Sucursales', icon: 'storefront', unit: 'sucursal' },
  users: { name: 'Usuarios', icon: 'group', unit: 'usuario' },
}
const ORDER = ['companies', 'branches', 'users']

const CURRENCIES = ['MXN', 'USD', 'EUR']

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(n)

// Con comas de miles y 2 decimales, pero editable — mientras el campo tiene foco
// se muestra el número "en crudo" (sin comas) para no pelear con la posición del
// cursor mientras se escribe; al salir del campo se reformatea.
const fmtInput = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Precio por cada empresa/sucursal/usuario EXTRA que una licencia pida arriba de
// lo incluido gratis — se usa para calcular el cobro automático cuando el admin
// sube un límite en el modal de Licencias (pestaña Límites), igual que ya pasa
// con los módulos (ver LicensesService.createLimitIncreaseCharges).
export default function LimitPricing() {
  const { data: remote, loading, error } = useFetch<LimitPricingRow[]>(
    () => APIs.getLimitPricing<LimitPricingRow[]>(),
  )

  const [rows, setRows] = useState<LimitPricingRow[]>([])
  const [currency, setCurrency] = useState('MXN')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  // Qué input de precio tiene el foco ahora mismo (`${kind}-${field}`) — mientras
  // se edita se ve el número sin formatear, el resto de los campos sí con comas.
  const [focusedCell, setFocusedCell] = useState<string | null>(null)

  useEffect(() => {
    if (remote) {
      setRows(ORDER.map((kind) => remote.find((r) => r.kind === kind) ?? { kind, includedFree: 1, priceMonthly: 0, priceAnnual: 0, currency: 'MXN' }))
      if (remote[0]?.currency) setCurrency(remote[0].currency)
    }
  }, [remote])

  const setField = (kind: string, field: 'includedFree' | 'priceMonthly' | 'priceAnnual', val: string) => {
    const num = field === 'includedFree' ? (parseInt(val, 10) || 0) : (parseFloat(val) || 0)
    setRows((prev) => prev.map((r) => (r.kind === kind ? { ...r, [field]: num } : r)))
    setDirty(true)
    setMsg(null)
  }

  const handleCurrencyChange = (c: string) => {
    setCurrency(c)
    setRows((prev) => prev.map((r) => ({ ...r, currency: c })))
    setDirty(true)
  }

  const reset = () => {
    if (remote) setRows(ORDER.map((kind) => remote.find((r) => r.kind === kind) ?? { kind, includedFree: 1, priceMonthly: 0, priceAnnual: 0, currency: 'MXN' }))
    setDirty(false)
    setMsg(null)
  }

  const save = async () => {
    setSaving(true)
    setMsg(null)
    try {
      await APIs.updateLimitPricing(
        rows.map((r) => ({
          kind: r.kind,
          includedFree: r.includedFree,
          priceMonthly: r.priceMonthly,
          priceAnnual: r.priceAnnual,
          currency,
        })),
      )
      setMsg({ ok: true, text: 'Precios guardados correctamente.' })
      setDirty(false)
    } catch (e: any) {
      setMsg({ ok: false, text: e.message ?? 'Error al guardar.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mp-page lp-page">
      <div className="mp-head">
        <div className="mp-head-text">
          <p>Cuánto cuesta cada empresa, sucursal o usuario extra arriba de lo incluido en una licencia.</p>
        </div>
        <div className="mp-currency-row">
          <span className="msr" style={{ fontSize: 16 }}>attach_money</span>
          Moneda:
          <select className="mp-currency-select" value={currency} onChange={(e) => handleCurrencyChange(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="mp-summary">
        {rows.map((r) => {
          const meta = LABELS[r.kind]
          if (!meta) return null
          return (
            <div className="mp-summary-card" key={r.kind}>
              <div className="mp-summary-label">{meta.name} — por {meta.unit} extra (mensual)</div>
              <div className="mp-summary-value">{fmt(r.priceMonthly, currency)}</div>
              <div className="mp-summary-sub">{r.includedFree} incluida{r.includedFree === 1 ? '' : 's'} sin costo</div>
            </div>
          )
        })}
      </div>

      {loading ? (
        <div className="panel"><div className="state">Cargando…</div></div>
      ) : error ? (
        <div className="panel"><div className="state state--error">{error}</div></div>
      ) : (
        <div className="lp-rows">
          {rows.map((r) => {
            const meta = LABELS[r.kind]
            if (!meta) return null
            return (
              <div className="lp-row" key={r.kind}>
                <div className="lp-row__info">
                  <span className="msr lp-row__icon">{meta.icon}</span>
                  <div>
                    <div className="lp-row__name">{meta.name}</div>
                    <div className="lp-row__desc">Límite global de la licencia</div>
                  </div>
                </div>

                <div className="lp-row__field">
                  <span className="lp-row__field-label">Incluidas</span>
                  <div className="lp-number-wrap">
                    <input
                      className="lp-number-input"
                      type="number"
                      min={0}
                      step="1"
                      value={r.includedFree}
                      onChange={(e) => setField(r.kind, 'includedFree', e.target.value)}
                    />
                  </div>
                </div>

                <div className="lp-row__field">
                  <span className="lp-row__field-label">Mensual c/u extra</span>
                  <div className="mp-price-wrap">
                    <span className="mp-price-symbol">$</span>
                    <input
                      className="mp-price-input"
                      type="text"
                      inputMode="decimal"
                      style={{ width: '100%' }}
                      value={
                        r.priceMonthly === 0
                          ? ''
                          : focusedCell === `${r.kind}-priceMonthly`
                            ? String(r.priceMonthly)
                            : fmtInput(r.priceMonthly)
                      }
                      placeholder="0.00"
                      onFocus={() => setFocusedCell(`${r.kind}-priceMonthly`)}
                      onBlur={() => setFocusedCell(null)}
                      onChange={(e) => setField(r.kind, 'priceMonthly', e.target.value.replace(/,/g, ''))}
                    />
                  </div>
                </div>

                <div className="lp-row__field">
                  <span className="lp-row__field-label">Anual c/u extra</span>
                  <div className="mp-price-wrap">
                    <span className="mp-price-symbol">$</span>
                    <input
                      className="mp-price-input"
                      type="text"
                      inputMode="decimal"
                      style={{ width: '100%' }}
                      value={
                        r.priceAnnual === 0
                          ? ''
                          : focusedCell === `${r.kind}-priceAnnual`
                            ? String(r.priceAnnual)
                            : fmtInput(r.priceAnnual)
                      }
                      placeholder="0.00"
                      onFocus={() => setFocusedCell(`${r.kind}-priceAnnual`)}
                      onBlur={() => setFocusedCell(null)}
                      onChange={(e) => setField(r.kind, 'priceAnnual', e.target.value.replace(/,/g, ''))}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && (
        <div className="mp-save-bar">
          {msg ? (
            <div className={`mp-msg ${msg.ok ? 'mp-msg--ok' : 'mp-msg--err'}`}>
              <span className="msr" style={{ fontSize: 15 }}>{msg.ok ? 'check_circle' : 'error'}</span>
              {msg.text}
            </div>
          ) : (
            <span className="mp-save-info">
              {dirty
                ? <><span className="msr" style={{ fontSize: 15 }}>edit</span> Tienes cambios sin guardar</>
                : <><span className="msr" style={{ fontSize: 15 }}>check_circle</span> Sin cambios pendientes</>}
            </span>
          )}
          <div className="mp-save-actions">
            <button className="mp-btn-reset" onClick={reset} disabled={!dirty || saving}>
              Descartar
            </button>
            <button className="mp-btn-save" onClick={save} disabled={!dirty || saving}>
              {saving
                ? <><span className="msr mp-spin" style={{ fontSize: 15 }}>progress_activity</span> Guardando…</>
                : <><span className="msr" style={{ fontSize: 15 }}>save</span> Guardar precios</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
