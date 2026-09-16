import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'top50-watchlist'

function readStoredSymbols(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((s): s is string => typeof s === 'string'))
  } catch {
    return new Set()
  }
}

function writeStoredSymbols(symbols: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...symbols]))
  } catch {
    // Storage unavailable (private mode, quota, …) – favorites just won't persist.
  }
}

export function useWatchlist() {
  const [favorites, setFavorites] = useState<Set<string>>(() => readStoredSymbols())

  useEffect(() => {
    writeStoredSymbols(favorites)
  }, [favorites])

  const toggle = useCallback((symbol: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(symbol)) {
        next.delete(symbol)
      } else {
        next.add(symbol)
      }
      return next
    })
  }, [])

  const isFavorite = useCallback((symbol: string) => favorites.has(symbol), [favorites])

  return { favorites, isFavorite, toggle }
}
