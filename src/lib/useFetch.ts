import { useEffect, useState } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Hook genérico para cargar datos del backend.
 * Maneja loading/error/data en un solo lugar.
 */
export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  })
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    // OJO: limpia `data` (no solo loading/error) — si no, al cambiar de licencia
    // (o cualquier dep) se seguían mostrando los datos VIEJOS mientras cargaba
    // lo nuevo. En modales como el de licencias, eso dejaba ver el historial de
    // cobros de la licencia anterior por un instante — y si alguien hacía clic
    // ahí, mandaba el id de un cobro de OTRA licencia ("Cobro no encontrado").
    setState({ data: null, loading: true, error: null })

    fetcher()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null })
      })
      .catch((err: Error) => {
        if (active)
          setState({ data: null, loading: false, error: err.message })
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reload])

  return { ...state, refetch: () => setReload((r) => r + 1) }
}
