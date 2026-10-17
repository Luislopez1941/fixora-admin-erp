import { useState, useEffect } from 'react'
import APIs from '../services/APIs'
import { useFetch } from '../lib/useFetch'
import type { ModulePricingRow } from '../lib/types'
import { TAXONOMY_MODULES } from '../lib/modules-taxonomy.generated'
import { isLegacyModule, legacyBadge, legacyNote, moduleIcon, moduleLabel, moduleOrder, screenCount, taxonomyModule } from '../lib/moduleMeta'
import './pages.css'
import './ModulePricing.css'

const CURRENCIES = ['MXN', 'USD', 'EUR']

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(n)

function PriceField({ label, value, onChange, compact }: { label: string; value: number; onChange: (value: string) => void; compact?: boolean }) {
  return (
    <label className={`mp-field ${compact ? 'mp-field--compact' : ''}`}>
      <span>{label}</span>
      <div className="mp-price-wrap">
        <span className="mp-price-symbol">$</span>
        <input
          className="mp-price-input"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={value === 0 ? '' : value}
          placeholder="0.00"
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
      </div>
    </label>
  )
}

export default function ModulePricing() {
  const { data: remote, loading, error, refetch } = useFetch<ModulePricingRow[]>(
    () => APIs.getModulePricing<ModulePricingRow[]>(),
  )

  const [rows, setRows] = useState<ModulePricingRow[]>([])
  const [currency, setCurrency] = useState('MXN')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  // Los submódulos y sus pantallas se ven abiertos por defecto; aquí solo se guardan los que se contraen
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const toggle = (key: string) => setCollapsed((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next })
  const [syncing, setSyncing] = useState(false)

  // Agrupa por sección: un módulo con submódulos (ej. "sales" → "sales.sheet",
  // "sales.quote"…) nunca lleva precio propio — su costo es la suma de sus hijos.
  // Así, seleccionar la sección completa en una licencia nunca cobra doble (el
  // padre y sus hijos al mismo tiempo), que era justo el bug: antes "Ventas" tenía
  // SU PROPIO precio ADEMÁS del de sus hijos.
  const sections = (() => {
    // Mismo orden que el menú del ERP (taxonomía de módulos); los heredados y desconocidos al final
    const parents = rows
      .filter((r) => !r.moduleId.includes('.'))
      .sort((a, b) => moduleOrder(a.moduleId) - moduleOrder(b.moduleId))
    return parents.map((parent) => ({
      parent,
      parentIndex: rows.indexOf(parent),
      children: rows
        .map((r, idx) => ({ row: r, idx }))
        .filter(({ row }) => row.moduleId !== parent.moduleId && row.moduleId.startsWith(`${parent.moduleId}.`)),
    }))
  })()

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
      await APIs.updateModulePricing({
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

  // Submódulos de la taxonomía que todavía no tienen fila en el catálogo (el seed o el botón los crea)
  const expectedKeys = TAXONOMY_MODULES.flatMap((m) => [m.key, ...m.groups.filter((g) => g.key).map((g) => `${m.key}.${g.key}`)])
  const present = new Set(rows.map((r) => r.moduleId))
  const missingCount = rows.length ? expectedKeys.filter((k) => !present.has(k)).length : 0

  const syncCatalog = async () => {
    setSyncing(true)
    setMsg(null)
    try {
      const res: any = await APIs.syncModulesCatalog()
      setMsg({ ok: true, text: `Catálogo sincronizado: ${res?.created ?? 0} filas nuevas, ${res?.renamed ?? 0} nombres actualizados. Los precios no se tocaron.` })
      refetch()
    } catch (e: any) {
      setMsg({ ok: false, text: e.message ?? 'No se pudo sincronizar el catálogo.' })
    } finally {
      setSyncing(false)
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
          <div className="mp-summary-sub">{sections.length} módulos · {sections.reduce((n, { parent }) => n + screenCount(parent.moduleId), 0)} pantallas</div>
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

      {missingCount > 0 && (
        <div className="mp-sync">
          <span className="msr">sync_problem</span>
          <div>
            <strong>Faltan {missingCount} filas en el catálogo</strong>
            <p>Los submódulos de la nueva estructura (Punto de venta, Gestión comercial…) todavía no existen en la base, por eso no se les puede poner precio. Sincroniza el catálogo: crea lo que falta y no toca ningún precio.</p>
          </div>
          <button type="button" className="mp-btn-save" onClick={syncCatalog} disabled={syncing}>
            {syncing ? 'Sincronizando…' : 'Sincronizar catálogo'}
          </button>
        </div>
      )}

      <div className="mp-toolbar">
        <span className="mp-hint">
          <b>Cómo se cobra:</b> el precio de un módulo es la suma de sus <b>tarifas por sección</b> (las de siempre) y el precio de sus <b>submódulos</b>.
          Las <b>pantallas</b> no se cobran: pertenecen a un submódulo. Verde: ya existe en el ERP · punteado: en construcción.
        </span>
        <button type="button" className="mp-link-btn" onClick={() => setCollapsed(new Set())}>Expandir todo</button>
        <button type="button" className="mp-link-btn" onClick={() => setCollapsed(new Set(sections.map(({ parent }) => parent.moduleId)))}>Contraer todo</button>
      </div>

      {/* Módulos en tarjetas: precios, secciones con licencia propia y pantallas agrupadas */}
      {loading ? (
        <div className="panel"><div className="state">Cargando módulos…</div></div>
      ) : error ? (
        <div className="panel"><div className="state state--error">{error}</div></div>
      ) : (
        <div className="mp-grid">
          {sections.map(({ parent, parentIndex, children }) => {
            const hasChildren = children.length > 0
            const sectionMonthly = hasChildren ? children.reduce((sum, { row }) => sum + row.priceMonthly, 0) : parent.priceMonthly
            const sectionAnnual = hasChildren ? children.reduce((sum, { row }) => sum + row.priceAnnual, 0) : parent.priceAnnual
            const tax = taxonomyModule(parent.moduleId)
            const legacy = isLegacyModule(parent.moduleId)
            const isOpen = !collapsed.has(parent.moduleId)
            const groups = tax?.groups ?? []
            // Submódulos = grupos de pantallas (fila propia en el catálogo); el resto de los hijos son secciones con tarifa heredada
            const groupKeys = new Set(groups.filter((g) => g.key).map((g) => `${parent.moduleId}.${g.key}`))
            const groupRows = new Map(children.filter(({ row }) => groupKeys.has(row.moduleId)).map(({ row, idx }) => [row.moduleId, { row, idx }]))
            const sectionChildren = children.filter(({ row }) => !groupKeys.has(row.moduleId))
            const groupCount = groups.filter((g) => g.label).length || (groups.length ? 1 : 0)
            const screens = screenCount(parent.moduleId)
            const description = legacyNote(parent.moduleId) ?? tax?.description ?? parent.description

            return (
              <article key={parent.moduleId} className={`mp-card ${legacy ? 'mp-card--legacy' : ''} ${isOpen ? 'mp-card--open' : ''}`}>
                <header className="mp-card-head">
                  <span className="msr mp-mod-icon">{moduleIcon(parent.moduleId)}</span>
                  <div className="mp-card-title">
                    <h3>
                      {moduleLabel(parent.moduleId, parent.name)}
                      {legacy && <span className="mp-badge mp-badge--legacy">{legacyBadge(parent.moduleId)}</span>}
                      {!tax && !legacy && <span className="mp-badge">Sin taxonomía</span>}
                    </h3>
                    {description && <p>{description}</p>}
                  </div>
                </header>

                <div className="mp-card-prices">
                  {hasChildren ? (
                    <>
                      <div className="mp-total"><span>Mensual</span><strong>{fmt(sectionMonthly, currency)}</strong></div>
                      <div className="mp-total"><span>Anual</span><strong>{fmt(sectionAnnual, currency)}</strong></div>
                    </>
                  ) : (
                    <>
                      <PriceField label="Mensual" value={parent.priceMonthly} onChange={(v) => setPrice(parentIndex, 'priceMonthly', v)} />
                      <PriceField label="Anual" value={parent.priceAnnual} onChange={(v) => setPrice(parentIndex, 'priceAnnual', v)} />
                    </>
                  )}
                </div>

                {sectionChildren.length > 0 && <p className="mp-caption">Tarifas por sección (anteriores)</p>}
                {sectionChildren.length > 0 && (
                  <ul className="mp-subs" aria-label={`Licencias por sección de ${parent.name}`}>
                    {sectionChildren.map(({ row, idx }) => (
                      <li key={row.moduleId} className="mp-sub">
                        <span className="mp-sub-name" title={row.description || row.name}>{row.name}</span>
                        <PriceField compact label="Mensual" value={row.priceMonthly} onChange={(v) => setPrice(idx, 'priceMonthly', v)} />
                        <PriceField compact label="Anual" value={row.priceAnnual} onChange={(v) => setPrice(idx, 'priceAnnual', v)} />
                      </li>
                    ))}
                  </ul>
                )}

                {!isOpen && groups.some((g) => g.label) && (
                  <div className="mp-group-tags" aria-label="Grupos de pantallas">
                    {groups.filter((g) => g.label).map((g) => (
                      <span key={g.label} className="mp-tag">{g.label}<b>{g.screens.length}</b></span>
                    ))}
                  </div>
                )}

                {screens > 0 && (
                  <button type="button" className="mp-screens-toggle" onClick={() => toggle(parent.moduleId)} aria-expanded={isOpen}>
                    <span className="msr" style={{ fontSize: 18 }}>{isOpen ? 'expand_less' : 'expand_more'}</span>
                    {isOpen ? 'Ocultar' : 'Ver'} {groupCount} {groupCount === 1 ? 'submódulo' : 'submódulos'} · {screens} pantallas
                  </button>
                )}

                {isOpen && (
                  <>
                  <p className="mp-caption">Submódulos y pantallas{groupRows.size > 0 ? ' · precio por submódulo (0 = incluido en el módulo)' : ''}</p>
                  <div className="mp-groups">
                    {groups.map((g, gi) => (
                      <section className="mp-group" key={gi}>
                        <h4>{g.label ?? 'Pantallas'}<span>{g.screens.length}</span></h4>
                        {g.key && groupRows.get(`${parent.moduleId}.${g.key}`) && (() => {
                          const { row, idx } = groupRows.get(`${parent.moduleId}.${g.key}`)!
                          return (
                            <div className="mp-group-prices" title="Precio del submódulo (0 = incluido)">
                              <PriceField label="Mensual" value={row.priceMonthly} onChange={(v) => setPrice(idx, 'priceMonthly', v)} />
                              <PriceField label="Anual" value={row.priceAnnual} onChange={(v) => setPrice(idx, 'priceAnnual', v)} />
                            </div>
                          )
                        })()}
                        <div className="mp-screens-chips">
                          {g.screens.map((sc) => (
                            <span key={sc.label} className={`mp-chip ${sc.live ? 'mp-chip--live' : ''}`} title={sc.live ? 'Ya está disponible en el ERP' : 'En construcción'}>
                              {sc.label}
                            </span>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                  </>
                )}
              </article>
            )
          })}
        </div>
      )}

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
