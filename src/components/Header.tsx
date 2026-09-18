import { SectorFilter } from './SectorFilter'

export type View = 'all' | 'watchlist'

interface Props {
  query: string
  onQueryChange: (value: string) => void
  view: View
  onViewChange: (view: View) => void
  watchlistCount: number
  sectors: string[]
  selectedSector: string | null
  onSectorChange: (sector: string | null) => void
}

export function Header({
  query,
  onQueryChange,
  view,
  onViewChange,
  watchlistCount,
  sectors,
  selectedSector,
  onSectorChange,
}: Props) {
  return (
    <header className="sticky top-0 z-10 -mx-4 px-4 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-3 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-black/[0.06] dark:border-white/[0.08]">
      <div className="mx-auto max-w-xl">
        <h1 className="text-[32px] sm:text-[34px] font-bold tracking-tight">
          Top 50
        </h1>
        <p className="mt-0.5 text-[15px] text-black/50 dark:text-white/50">
          Beste Performer der letzten 3 Monate
        </p>

        <div className="mt-3">
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Suchen"
            className="w-full rounded-xl border-none bg-black/[0.05] dark:bg-white/[0.08] px-3.5 py-2 text-[15px] placeholder:text-black/40 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
          />
        </div>

        <div
          role="tablist"
          className="mt-3 inline-flex rounded-lg bg-black/[0.05] p-0.5 text-[13px] font-medium dark:bg-white/[0.08]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === 'all'}
            onClick={() => onViewChange('all')}
            className={`rounded-[7px] px-3.5 py-1.5 transition-colors ${
              view === 'all'
                ? 'bg-white text-black shadow-sm dark:bg-white/15 dark:text-white'
                : 'text-black/50 dark:text-white/50'
            }`}
          >
            Alle
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'watchlist'}
            onClick={() => onViewChange('watchlist')}
            className={`rounded-[7px] px-3.5 py-1.5 transition-colors ${
              view === 'watchlist'
                ? 'bg-white text-black shadow-sm dark:bg-white/15 dark:text-white'
                : 'text-black/50 dark:text-white/50'
            }`}
          >
            Watchlist{watchlistCount > 0 ? ` (${watchlistCount})` : ''}
          </button>
        </div>

        <SectorFilter
          sectors={sectors}
          selected={selectedSector}
          onChange={onSectorChange}
        />
      </div>
    </header>
  )
}
