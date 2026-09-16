import { useMemo, useState } from 'react'
import { Header, type View } from './components/Header'
import { StockRow } from './components/StockRow'
import { UpdatedFooter } from './components/UpdatedFooter'
import { useTopStocks } from './hooks/useTopStocks'
import { useWatchlist } from './hooks/useWatchlist'

function App() {
  const { data, loading, error } = useTopStocks()
  const { favorites, isFavorite, toggle } = useWatchlist()
  const [query, setQuery] = useState('')
  const [view, setView] = useState<View>('all')

  const filtered = useMemo(() => {
    if (!data) return []
    const base =
      view === 'watchlist'
        ? data.stocks.filter((s) => favorites.has(s.symbol))
        : data.stocks
    const q = query.trim().toLowerCase()
    if (!q) return base
    return base.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    )
  }, [data, query, view, favorites])

  return (
    <div className="min-h-screen">
      <Header
        query={query}
        onQueryChange={setQuery}
        view={view}
        onViewChange={setView}
        watchlistCount={favorites.size}
      />

      <main className="mx-auto max-w-xl px-1 sm:px-4 pt-2">
        {loading && !data && (
          <div className="flex flex-col items-center gap-3 py-24 text-black/40 dark:text-white/40">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <p className="text-[15px]">Lade aktuelle Kurse …</p>
          </div>
        )}

        {error && !data && (
          <div className="mx-3 mt-6 rounded-2xl bg-down/10 px-4 py-4 text-[14px] text-down">
            Daten konnten nicht geladen werden ({error}). Bitte später erneut
            versuchen.
          </div>
        )}

        {data && (
          <>
            {filtered.length === 0 ? (
              <p className="px-4 py-12 text-center text-[15px] text-black/40 dark:text-white/40">
                {view === 'watchlist' && !query
                  ? 'Noch keine Favoriten – tippe auf den Stern bei einer Aktie, um sie zur Watchlist hinzuzufügen.'
                  : `Keine Treffer für „${query}“`}
              </p>
            ) : (
              <ul className="divide-y divide-black/[0.05] dark:divide-white/[0.07]">
                {filtered.map((stock) => (
                  <StockRow
                    key={stock.symbol}
                    stock={stock}
                    isFavorite={isFavorite(stock.symbol)}
                    onToggleFavorite={toggle}
                  />
                ))}
              </ul>
            )}
            <UpdatedFooter
              updatedAt={data.updatedAt}
              universeSize={data.universeSize}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default App
