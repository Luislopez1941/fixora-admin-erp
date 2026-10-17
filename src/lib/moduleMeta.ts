import { TAXONOMY_MODULES } from './modules-taxonomy.generated'

/** Módulos heredados: siguen en licencias ya emitidas, pero su contenido ahora vive en otro módulo. */
const LEGACY: Record<string, { label: string; symbol: string; note: string; badge?: string }> = {
  // No es un módulo de licencia: el dueño siempre lo tiene. Si quedó una fila vieja en el catálogo, aquí se explica.
  'module-store': { label: 'Tienda de módulos', symbol: 'storefront', badge: 'No se licencia', note: 'Siempre disponible para el dueño de la cuenta; no lleva precio. Se puede retirar del catálogo.' },
  income: { label: 'Ingresos', symbol: 'trending_up', note: 'Heredado: ya no tiene pantalla. Se puede retirar del catálogo.' },
  users: { label: 'Usuarios', symbol: 'group', note: 'Heredado: ahora lo cubre "Administración y seguridad".' },
  configurations: { label: 'Configuraciones', symbol: 'settings', note: 'Heredado: ahora lo cubre "Administración y seguridad".' },
}

const byKey = new Map(TAXONOMY_MODULES.map((m) => [m.key, m]))

/** Módulo de la taxonomía (nombre, icono, orden y pantallas), si existe. */
export const taxonomyModule = (key: string) => byKey.get(key)

export const isLegacyModule = (key: string) => key in LEGACY
export const legacyBadge = (key: string) => LEGACY[key]?.badge ?? 'Heredado'
export const legacyNote = (key: string) => LEGACY[key]?.note

/** Icono Material Symbols de un módulo; `fallback` para claves que no conocemos. */
export const moduleIcon = (key: string, fallback = 'extension') => byKey.get(key)?.symbol ?? LEGACY[key]?.symbol ?? fallback

/** Orden del menú del ERP; los heredados y desconocidos van al final. */
export const moduleOrder = (key: string) => byKey.get(key)?.order ?? (key in LEGACY ? 900 : 1000)

export const moduleLabel = (key: string, fallback: string) => byKey.get(key)?.label ?? fallback

export const screenCount = (key: string) => byKey.get(key)?.groups.reduce((n, g) => n + g.screens.length, 0) ?? 0
