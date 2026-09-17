import { useCallback, useEffect, useState } from 'react'

function readSymbolFromHash(): string | null {
  const match = window.location.hash.match(/^#\/(.+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Tracks the selected stock symbol via the URL hash (#/AAPL), so the
 * browser/Android back button and iOS swipe-back work without a router
 * dependency, and works as a plain static file on GitHub Pages.
 */
export function useSelectedSymbol() {
  const [symbol, setSymbol] = useState<string | null>(() => readSymbolFromHash())

  useEffect(() => {
    const onHashChange = () => setSymbol(readSymbolFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const select = useCallback((next: string) => {
    window.location.hash = `/${encodeURIComponent(next)}`
  }, [])

  const clear = useCallback(() => {
    window.location.hash = ''
  }, [])

  return { symbol, select, clear }
}
