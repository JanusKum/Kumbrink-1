import type { SectorSummary, Stock } from '../types'
import { RankedStockList } from './RankedStockList'
import { SectionHeader } from './SectionHeader'
import { SectorRow } from './SectorRow'

interface Props {
  sectors: SectorSummary[]
  openSector: string | null
  onOpenSector: (name: string | null) => void
  sectorStocks: Stock[]
  isFavorite: (symbol: string) => boolean
  onToggleFavorite: (symbol: string) => void
  onSelect: (symbol: string) => void
}

export function SectorsView({
  sectors,
  openSector,
  onOpenSector,
  sectorStocks,
  isFavorite,
  onToggleFavorite,
  onSelect,
}: Props) {
  if (openSector) {
    return (
      <div className="min-h-screen">
        <SectionHeader
          title={openSector}
          subtitle="Top 10 nach 3-Monats-Performance"
          onBack={() => onOpenSector(null)}
          backLabel="Branchen"
        />
        <main className="mx-auto max-w-xl px-1 sm:px-4 pb-24 pt-2">
          <RankedStockList
            stocks={sectorStocks}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onSelect={onSelect}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SectionHeader
        title="Branchen"
        subtitle="Sortiert nach Ø 3-Monats-Performance"
      />
      <main className="mx-auto max-w-xl px-1 sm:px-4 pb-24 pt-2">
        <ul className="divide-y divide-black/[0.05] dark:divide-white/[0.07]">
          {sectors.map((sector, i) => (
            <SectorRow key={sector.name} sector={sector} rank={i + 1} onSelect={onOpenSector} />
          ))}
        </ul>
      </main>
    </div>
  )
}
