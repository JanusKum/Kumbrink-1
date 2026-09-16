import { useEffect, useState } from 'react'
import type { Top50Data } from '../types'

const DATA_URL = `${import.meta.env.BASE_URL}data/top50.json`
// Re-check for fresh data periodically so an open tab picks up the
// scheduled GitHub Actions refresh without a manual reload.
const REFRESH_INTERVAL_MS = 15 * 60 * 1000

interface State {
  data: Top50Data | null
  loading: boolean
  error: string | null
}

export function useTopStocks() {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        // No cache-busting query param: keeps the URL stable so the
        // service worker's runtime cache can match and serve it offline.
        const res = await fetch(DATA_URL, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as Top50Data
        if (!cancelled) {
          setState({ data: json, loading: false, error: null })
        }
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({
            data: prev.data,
            loading: false,
            error: err instanceof Error ? err.message : 'Unbekannter Fehler',
          }))
        }
      }
    }

    load()
    const interval = setInterval(load, REFRESH_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return state
}
