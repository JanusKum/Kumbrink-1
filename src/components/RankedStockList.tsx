import type { Stock } from '../types'
import { StockRow } from './StockRow'

interface Props {
  stocks: Stock[]
  isFavorite: (symbol: string) => boolean
  onToggleFavorite: (symbol: string) => void
  onSelect: (symbol: string) => void
  emptyMessage?: string
  /** Picks which change % each row shows/colors by (defaults to the 3-month figure). */
  getChangePct?: (stock: Stock) => number
}

export function RankedStockList({
  stocks,
  isFavorite,
  onToggleFavorite,
  onSelect,
  emptyMessage = 'Keine Titel gefunden.',
  getChangePct,
}: Props) {
  if (stocks.length === 0) {
    return (
      <p className="px-4 py-12 text-center text-[15px] text-black/40 dark:text-white/40">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="divide-y divide-black/[0.05] dark:divide-white/[0.07]">
      {stocks.map((stock) => (
        <StockRow
          key={stock.symbol}
          stock={stock}
          isFavorite={isFavorite(stock.symbol)}
          onToggleFavorite={onToggleFavorite}
          onSelect={onSelect}
          changePct={getChangePct?.(stock)}
        />
      ))}
    </ul>
  )
}
