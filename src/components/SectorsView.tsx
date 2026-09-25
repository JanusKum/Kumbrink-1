import type { SectorRange, SectorSummary, Stock } from '../types'
import { RankedStockList } from './RankedStockList'
import { SectionHeader } from './SectionHeader'
import { SectorRow } from './SectorRow'
import { StatBadge } from './StatBadge'

interface Props {
  sectors: SectorSummary[]
  openSector: string | null
  onOpenSector: (name: string | null) => void
  sectorStocks: Stock[]
  period: SectorRange
  onPeriodChange: (period: SectorRange) => void
  isFavorite: (symbol: string) => boolean
  onToggleFavorite: (symbol: string) => void
  onSelect: (symbol: string) => void
}

const PERIOD_LABELS: Record<SectorRange, string> = {
  '1w': '1W',
  '1mo': '1M',
  '3mo': '3M',
  '1y': '1J',
  '3y': '3J',
}

const PERIODS: SectorRange[] = ['1w', '1mo', '3mo', '1y', '3y']

type ChangePctField = 'changePct1w' | 'changePct1mo' | 'changePct3mo' | 'changePct1y' | 'changePct3y'

const CHANGE_FIELD: Record<SectorRange, ChangePctField> = {
  '1w': 'changePct1w',
  '1mo': 'changePct1mo',
  '3mo': 'changePct3mo',
  '1y': 'changePct1y',
  '3y': 'changePct3y',
}

function PeriodSelector({ period, onPeriodChange }: { period: SectorRange; onPeriodChange: (p: SectorRange) => void }) {
  return (
    <div
      role="tablist"
      className="mt-3 inline-flex rounded-lg bg-black/[0.05] p-0.5 text-[13px] font-medium dark:bg-white/[0.08]"
    >
      {PERIODS.map((p) => (
        <button
          key={p}
          type="button"
          role="tab"
          aria-selected={period === p}
          onClick={() => onPeriodChange(p)}
          className={`rounded-[7px] px-3.5 py-1.5 transition-colors ${
            period === p
              ? 'bg-white text-black shadow-sm dark:bg-white/15 dark:text-white'
              : 'text-black/50 dark:text-white/50'
          }`}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  )
}

export function SectorsView({
  sectors,
  openSector,
  onOpenSector,
  sectorStocks,
  period,
  onPeriodChange,
  isFavorite,
  onToggleFavorite,
  onSelect,
}: Props) {
  const getChangePct = (stock: Stock) => {
    const value = stock[CHANGE_FIELD[period]]
    return typeof value === 'number' ? value : stock.changePct3mo
  }

  if (openSector) {
    const sector = sectors.find((s) => s.name === openSector)
    return (
      <div className="min-h-screen">
        <SectionHeader
          title={openSector}
          subtitle={`Top 10 nach ${PERIOD_LABELS[period]}-Performance`}
          onBack={() => onOpenSector(null)}
          backLabel="Branchen"
        />
        <main className="mx-auto max-w-xl px-1 sm:px-4 pb-24 pt-2">
          <div className="px-3 sm:px-4">
            <PeriodSelector period={period} onPeriodChange={onPeriodChange} />
          </div>
          {sector && (
            <div className="mt-3 flex items-center gap-2 px-4 text-[13px] text-black/45 dark:text-white/45">
              <span>Ø {PERIOD_LABELS[period]}</span>
              <StatBadge changePct={sector.periods[period].avgChangePct} />
            </div>
          )}
          <div className="mt-2">
            <RankedStockList
              stocks={sectorStocks}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelect}
              getChangePct={getChangePct}
            />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SectionHeader
        title="Branchen"
        subtitle={`Sortiert nach Ø ${PERIOD_LABELS[period]}-Performance`}
      />
      <main className="mx-auto max-w-xl px-1 sm:px-4 pb-24 pt-2">
        <div className="px-3 sm:px-4">
          <PeriodSelector period={period} onPeriodChange={onPeriodChange} />
        </div>
        <ul className="mt-2 divide-y divide-black/[0.05] dark:divide-white/[0.07]">
          {sectors.map((sector, i) => (
            <SectorRow
              key={sector.name}
              sector={sector}
              rank={i + 1}
              avgChangePct={sector.periods[period].avgChangePct}
              onSelect={onOpenSector}
            />
          ))}
        </ul>
      </main>
    </div>
  )
}
