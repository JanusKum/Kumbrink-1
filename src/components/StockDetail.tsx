import { useMemo, useState } from 'react'
import type { ChartRange, Stock } from '../types'
import { FavoriteButton } from './FavoriteButton'
import { ShareButton } from './ShareButton'
import { Sparkline } from './Sparkline'
import { StatBadge } from './StatBadge'

interface Props {
  stock: Stock
  isFavorite: boolean
  onToggleFavorite: (symbol: string) => void
  onBack: () => void
  backLabel: string
}

const RANGE_LABELS: Record<ChartRange, string> = {
  '1mo': '1M',
  '3mo': '3M',
  '1y': '1J',
}

const RANGES: ChartRange[] = ['1mo', '3mo', '1y']

const priceFormatterCache = new Map<string, Intl.NumberFormat>()

const pctFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'always',
})

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

export function StockDetail({ stock, isFavorite, onToggleFavorite, onBack, backLabel }: Props) {
  const [range, setRange] = useState<ChartRange>('3mo')

  const historyByRange: Record<ChartRange, typeof stock.history> = {
    '1mo': stock.history1mo ?? [],
    '3mo': stock.history ?? [],
    '1y': stock.history1y ?? [],
  }
  const activeHistory = historyByRange[range]
  const hasHistory = activeHistory.length >= 2

  const { changePct, high, low } = useMemo(() => {
    if (!hasHistory) {
      return { changePct: stock.changePct3mo, high: stock.price, low: stock.price }
    }
    const closes = activeHistory.map((p) => p.c)
    const startPrice = closes[0]
    const pct = ((stock.price - startPrice) / startPrice) * 100
    return { changePct: pct, high: Math.max(...closes), low: Math.min(...closes) }
  }, [activeHistory, hasHistory, stock.changePct3mo, stock.price])

  const positive = changePct >= 0

  return (
    <div className="mx-auto max-w-xl">
      <header className="sticky top-0 z-10 -mx-4 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-2 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-black/[0.06] dark:border-white/[0.08]">
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 flex items-center gap-0.5 rounded-full py-2 pl-2 pr-3 text-[17px] text-black/70 hover:bg-black/[0.05] dark:text-white/70 dark:hover:bg-white/[0.08]"
        >
          <svg width="11" height="18" viewBox="0 0 11 18" fill="none">
            <path
              d="M9.5 1.5L1.5 9l8 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {backLabel}
        </button>

        <div className="flex items-center gap-1">
          <ShareButton
            title={`${stock.symbol} – ${stock.name}`}
            text={`${stock.symbol}: ${formatPrice(stock.price, stock.currency)} (${pctFormatter.format(changePct)}%) – ChartPuls`}
            url={window.location.href}
          />
          <FavoriteButton
            active={isFavorite}
            onToggle={() => onToggleFavorite(stock.symbol)}
            label={
              isFavorite
                ? `${stock.symbol} von der Watchlist entfernen`
                : `${stock.symbol} zur Watchlist hinzufügen`
            }
          />
        </div>
      </header>

      <main className="px-4 pt-4 pb-10">
        <h1 className="text-[28px] font-bold tracking-tight">{stock.symbol}</h1>
        <p className="text-[15px] text-black/50 dark:text-white/50">{stock.name}</p>
        <p className="mt-0.5 text-[13px] text-black/35 dark:text-white/35">
          {stock.sector}
        </p>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-[34px] font-bold tabular-nums leading-none">
            {formatPrice(stock.price, stock.currency)}
          </span>
          <StatBadge changePct={changePct} />
        </div>

        <div className="mt-6 h-56 w-full">
          {hasHistory ? (
            <Sparkline history={activeHistory} positive={positive} responsive width={400} height={160} />
          ) : (
            <div className="flex h-full items-center justify-center text-[14px] text-black/35 dark:text-white/35">
              Keine Daten für diesen Zeitraum
            </div>
          )}
        </div>

        <div
          role="tablist"
          className="mt-4 inline-flex rounded-lg bg-black/[0.05] p-0.5 text-[13px] font-medium dark:bg-white/[0.08]"
        >
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={range === r}
              onClick={() => setRange(r)}
              className={`rounded-[7px] px-4 py-1.5 transition-colors ${
                range === r
                  ? 'bg-white text-black shadow-sm dark:bg-white/15 dark:text-white'
                  : 'text-black/50 dark:text-white/50'
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>

        {hasHistory && (
          <div className="mt-6 flex gap-8 border-t border-black/[0.06] pt-4 dark:border-white/[0.08]">
            <div>
              <div className="text-[12px] text-black/40 dark:text-white/40">Hoch</div>
              <div className="text-[15px] font-semibold tabular-nums">
                {formatPrice(high, stock.currency)}
              </div>
            </div>
            <div>
              <div className="text-[12px] text-black/40 dark:text-white/40">Tief</div>
              <div className="text-[15px] font-semibold tabular-nums">
                {formatPrice(low, stock.currency)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
