import { useMemo, useState } from 'react'
import { Header, type View } from './components/Header'
import { StockDetail } from './components/StockDetail'
import { StockRow } from './components/StockRow'
import { UpdatedFooter } from './components/UpdatedFooter'
import { useMarketData } from './hooks/useMarketData'
import { useSelectedSymbol } from './hooks/useSelectedSymbol'
import { useWatchlist } from './hooks/useWatchlist'
import { buildStock, buildStockList } from './lib/buildStock'

function App() {
  const { data, loading, error } = useMarketData()
  const { favorites, isFavorite, toggle } = useWatchlist()
  const { symbol: selectedSymbol, select, clear } = useSelectedSymbol()
  const [query, setQuery] = useState('')
  const [view, setView] = useState<View>('all')
  const [selectedSector, setSelectedSector] = useState<string | null>(null)

  function handleViewChange(next: View) {
    setView(next)
    setSelectedSector(null)
  }

  const top50Stocks = useMemo(
    () => (data ? buildStockList(data, data.top50) : []),
    [data],
  )

  const viewBase = useMemo(
    () =>
      view === 'watchlist'
        ? top50Stocks.filter((s) => favorites.has(s.symbol))
        : top50Stocks,
    [top50Stocks, view, favorites],
  )

  const sectors = useMemo(
    () => [...new Set(viewBase.map((s) => s.sector))].sort((a, b) => a.localeCompare(b, 'de')),
    [viewBase],
  )

  const filtered = useMemo(() => {
    const bySector = selectedSector
      ? viewBase.filter((s) => s.sector === selectedSector)
      : viewBase
    const q = query.trim().toLowerCase()
    if (!q) return bySector
    return bySector.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    )
  }, [viewBase, query, selectedSector])

  const selectedStock = useMemo(() => {
    if (!data || !selectedSymbol) return undefined
    const rank = data.top50.indexOf(selectedSymbol) + 1
    return buildStock(data, selectedSymbol, rank)
  }, [data, selectedSymbol])

  if (selectedSymbol && selectedStock) {
    return (
      <div className="min-h-screen">
        <StockDetail
          stock={selectedStock}
          isFavorite={isFavorite(selectedStock.symbol)}
          onToggleFavorite={toggle}
          onBack={clear}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        query={query}
        onQueryChange={setQuery}
        view={view}
        onViewChange={handleViewChange}
        watchlistCount={favorites.size}
        sectors={sectors}
        selectedSector={selectedSector}
        onSectorChange={setSelectedSector}
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

        {selectedSymbol && !selectedStock && data && (
          <div className="mx-3 mt-6 rounded-2xl bg-black/[0.04] px-4 py-4 text-[14px] text-black/50 dark:bg-white/[0.06] dark:text-white/50">
            „{selectedSymbol}“ ist aktuell nicht in den Top 50.
          </div>
        )}

        {data && (
          <>
            {filtered.length === 0 ? (
              <p className="px-4 py-12 text-center text-[15px] text-black/40 dark:text-white/40">
                {view === 'watchlist' && !query && !selectedSector
                  ? 'Noch keine Favoriten – tippe auf den Stern bei einer Aktie, um sie zur Watchlist hinzuzufügen.'
                  : query
                    ? `Keine Treffer für „${query}“`
                    : `Keine Titel im Sektor „${selectedSector}“`}
              </p>
            ) : (
              <ul className="divide-y divide-black/[0.05] dark:divide-white/[0.07]">
                {filtered.map((stock) => (
                  <StockRow
                    key={stock.symbol}
                    stock={stock}
                    isFavorite={isFavorite(stock.symbol)}
                    onToggleFavorite={toggle}
                    onSelect={select}
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
