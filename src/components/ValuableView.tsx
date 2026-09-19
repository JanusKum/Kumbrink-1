import type { Stock } from '../types'
import { RankedStockList } from './RankedStockList'
import { SectionHeader } from './SectionHeader'

interface Props {
  stocks: Stock[]
  isFavorite: (symbol: string) => boolean
  onToggleFavorite: (symbol: string) => void
  onSelect: (symbol: string) => void
}

export function ValuableView({ stocks, isFavorite, onToggleFavorite, onSelect }: Props) {
  return (
    <div className="min-h-screen">
      <SectionHeader
        title="Wertvollste"
        subtitle="Die größten Unternehmen im S&P 500"
      />
      <main className="mx-auto max-w-xl px-1 sm:px-4 pb-24 pt-2">
        <RankedStockList
          stocks={stocks}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onSelect={onSelect}
        />
      </main>
    </div>
  )
}
