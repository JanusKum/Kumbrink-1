import { useMemo, useState } from 'react'
import { BottomTabBar, type MainTab } from './components/BottomTabBar'
import { Header, type View } from './components/Header'
import { HomeView } from './components/HomeView'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { SectorsView } from './components/SectorsView'
import { StockDetail } from './components/StockDetail'
import { StockRow } from './components/StockRow'
import { UpdatedFooter } from './components/UpdatedFooter'
import { ValuableView } from './components/ValuableView'
import { useMarketData } from './hooks/useMarketData'
import { useSelectedSymbol } from './hooks/useSelectedSymbol'
import { useWatchlist } from './hooks/useWatchlist'
import { buildStock, buildStockList } from './lib/buildStock'
import { pickSpotlight } from './lib/pickSpotlight'

const TAB_LABELS: Record<MainTab, string> = {
  home: 'Home',
  top50: 'Top 50',
  valuable: 'Wertvollste',
  sectors: 'Branchen',
}

const HOME_SPOTLIGHT_SIZE = 4

function App() {
  const { data, error } = useMarketData()
  const { favorites, isFavorite, toggle } = useWatchlist()
  const { symbol: selectedSymbol, select, clear } = useSelectedSymbol()
  const [query, setQuery] = useState('')
  const [view, setView] = useState<View>('all')
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<MainTab>('home')
  const [openSector, setOpenSector] = useState<string | null>(null)

  function handleViewChange(next: View) {
    setView(next)
    setSelectedSector(null)
  }

  function handleTabChange(next: MainTab) {
    setActiveTab(next)
    if (next !== 'sectors') setOpenSector(null)
  }

  const top50Stocks = useMemo(
    () => (data ? buildStockList(data, data.top50) : []),
    [data],
  )

  const valuableStocks = useMemo(
    () => (data ? buildStockList(data, data.top20ByMarketCap) : []),
    [data],
  )

  const spotlightStocks = useMemo(
    () => (data ? pickSpotlight(buildStockList(data, data.topShortTerm), HOME_SPOTLIGHT_SIZE) : []),
    [data],
  )

  const sectorStocks = useMemo(() => {
    if (!data || !openSector) return []
    const sector = data.sectors.find((s) => s.name === openSector)
    return sector ? buildStockList(data, sector.top10) : []
  }, [data, openSector])

  const viewBase = useMemo(
    () =>
      view === 'watchlist'
        ? top50Stocks.filter((s) => favorites.has(s.symbol))
        : top50Stocks,
    [top50Stocks, view, favorites],
  )

  const sectorFilterOptions = useMemo(
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
    const rank =
      data.top50.indexOf(selectedSymbol) + 1 ||
      data.top20ByMarketCap.indexOf(selectedSymbol) + 1 ||
      data.sectors.flatMap((s) => s.top10).indexOf(selectedSymbol) + 1 ||
      (data.topShortTerm ?? []).indexOf(selectedSymbol) + 1
    return buildStock(data, selectedSymbol, rank)
  }, [data, selectedSymbol])

  if (selectedSymbol && selectedStock) {
    const backLabel = activeTab === 'sectors' ? (openSector ?? TAB_LABELS.sectors) : TAB_LABELS[activeTab]
    return (
      <div className="min-h-screen">
        <StockDetail
          stock={selectedStock}
          isFavorite={isFavorite(selectedStock.symbol)}
          onToggleFavorite={toggle}
          onBack={clear}
          backLabel={backLabel}
        />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen">
        {error ? (
          <div className="mx-3 mt-[calc(env(safe-area-inset-top)+2rem)] rounded-2xl bg-down/10 px-4 py-4 text-[14px] text-down">
            Daten konnten nicht geladen werden ({error}). Bitte später erneut
            versuchen.
          </div>
        ) : (
          <LoadingSkeleton />
        )}
        <BottomTabBar active={activeTab} onChange={handleTabChange} />
      </div>
    )
  }

  if (activeTab === 'home') {
    return (
      <div className="min-h-screen animate-[fade-slide-in_0.3s_ease-out]">
        <HomeView
          spotlightStocks={spotlightStocks}
          news={data.news ?? []}
          ipoNews={data.ipoNews ?? []}
          onSelectStock={select}
        />
        <BottomTabBar active={activeTab} onChange={handleTabChange} />
      </div>
    )
  }

  if (activeTab === 'valuable') {
    return (
      <div className="min-h-screen animate-[fade-slide-in_0.3s_ease-out]">
        <ValuableView
          stocks={valuableStocks}
          isFavorite={isFavorite}
          onToggleFavorite={toggle}
          onSelect={select}
        />
        <BottomTabBar active={activeTab} onChange={handleTabChange} />
      </div>
    )
  }

  if (activeTab === 'sectors') {
    return (
      <div className="min-h-screen animate-[fade-slide-in_0.3s_ease-out]">
        <SectorsView
          sectors={data.sectors}
          openSector={openSector}
          onOpenSector={setOpenSector}
          sectorStocks={sectorStocks}
          isFavorite={isFavorite}
          onToggleFavorite={toggle}
          onSelect={select}
        />
        <BottomTabBar active={activeTab} onChange={handleTabChange} />
      </div>
    )
  }

  return (
    <div className="min-h-screen animate-[fade-slide-in_0.3s_ease-out]">
      <Header
        query={query}
        onQueryChange={setQuery}
        view={view}
        onViewChange={handleViewChange}
        watchlistCount={favorites.size}
        sectors={sectorFilterOptions}
        selectedSector={selectedSector}
        onSectorChange={setSelectedSector}
      />

      <main className="mx-auto max-w-xl px-1 sm:px-4 pb-24 pt-2">
        {selectedSymbol && !selectedStock && (
          <div className="mx-3 mt-6 rounded-2xl bg-black/[0.04] px-4 py-4 text-[14px] text-black/50 dark:bg-white/[0.06] dark:text-white/50">
            „{selectedSymbol}“ wurde in keiner Ansicht gefunden.
          </div>
        )}

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
        <UpdatedFooter updatedAt={data.updatedAt} universeSize={data.universeSize} />
      </main>

      <BottomTabBar active={activeTab} onChange={handleTabChange} />
    </div>
  )
}

export default App
