import type { Stock } from '../types'
import { FavoriteButton } from './FavoriteButton'
import { Sparkline } from './Sparkline'
import { StatBadge } from './StatBadge'

interface Props {
  stock: Stock
  isFavorite: boolean
  onToggleFavorite: (symbol: string) => void
  onSelect: (symbol: string) => void
}

const priceFormatterCache = new Map<string, Intl.NumberFormat>()

function formatPrice(price: number, currency: string) {
  let formatter = priceFormatterCache.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    priceFormatterCache.set(currency, formatter)
  }
  return formatter.format(price)
}

export function StockRow({ stock, isFavorite, onToggleFavorite, onSelect }: Props) {
  const positive = stock.changePct3mo >= 0

  return (
    <li className="group flex items-center gap-1 sm:gap-2 rounded-2xl pl-3 sm:pl-4 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.06]">
      <FavoriteButton
        active={isFavorite}
        onToggle={() => onToggleFavorite(stock.symbol)}
        label={
          isFavorite
            ? `${stock.symbol} von der Watchlist entfernen`
            : `${stock.symbol} zur Watchlist hinzufügen`
        }
      />

      <button
        type="button"
        onClick={() => onSelect(stock.symbol)}
        className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4 py-3 pr-3 sm:pr-4 text-left"
      >
        <span className="w-6 shrink-0 text-right text-sm font-medium tabular-nums text-black/35 dark:text-white/35">
          {stock.rank}
        </span>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-black/[0.06] to-black/[0.02] dark:from-white/[0.12] dark:to-white/[0.04] text-[13px] font-bold tracking-tight">
          {stock.symbol.slice(0, 4)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold leading-tight">
            {stock.symbol}
          </div>
          <div className="truncate text-[13px] leading-tight text-black/50 dark:text-white/50">
            {stock.name}
          </div>
        </div>

        <div className="hidden sm:block shrink-0">
          <Sparkline history={stock.history} positive={positive} />
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-[15px] font-semibold tabular-nums">
            {formatPrice(stock.price, stock.currency)}
          </span>
          <StatBadge changePct={stock.changePct3mo} />
        </div>
      </button>
    </li>
  )
}
