import type { Stock } from '../types'
import { Sparkline } from './Sparkline'
import { StatBadge } from './StatBadge'

interface Props {
  stock: Stock
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

export function HomeMiniCard({ stock, onSelect }: Props) {
  const changePct = stock.changePct1w ?? stock.changePct3mo
  const positive = changePct >= 0
  const history = stock.history1mo.length >= 2 ? stock.history1mo : stock.history

  return (
    <button
      type="button"
      onClick={() => onSelect(stock.symbol)}
      className="flex flex-col rounded-2xl bg-black/[0.03] p-3 text-left transition-colors hover:bg-black/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold leading-tight">{stock.symbol}</div>
          <div className="truncate text-[11px] leading-tight text-black/45 dark:text-white/45">
            {stock.name}
          </div>
        </div>
      </div>

      <div className="mt-1.5 h-10 w-full">
        {history.length >= 2 ? (
          <Sparkline history={history} positive={positive} responsive width={200} height={60} />
        ) : (
          <div className="h-full" />
        )}
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-1">
        <span className="text-[13px] font-semibold tabular-nums">
          {formatPrice(stock.price, stock.currency)}
        </span>
        <StatBadge changePct={changePct} />
      </div>
    </button>
  )
}
