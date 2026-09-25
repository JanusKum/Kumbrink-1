import { useEffect, useMemo, useState } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import type { BenchmarkData, ChartRange, Stock, StockHistoryPoint } from '../types'
import { FavoriteButton } from './FavoriteButton'
import { InteractiveChart } from './InteractiveChart'
import { ShareButton } from './ShareButton'
import { StatBadge } from './StatBadge'

interface Props {
  stock: Stock
  isFavorite: boolean
  onToggleFavorite: (symbol: string) => void
  onBack: () => void
  backLabel: string
  benchmark?: BenchmarkData
}

const RANGE_LABELS: Record<ChartRange, string> = {
  '1d': '1D',
  '1w': '1W',
  '1mo': '1M',
  '3mo': '3M',
  '1y': '1J',
  '3y': '3J',
  '5y': '5J',
}

const RANGES: ChartRange[] = ['1d', '1w', '1mo', '3mo', '1y', '3y', '5y']

const priceFormatterCache = new Map<string, Intl.NumberFormat>()

const pctFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'always',
})

const timeFormatter = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' })
const weekdayTimeFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
const dateFormatter = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

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

function formatPointLabel(point: StockHistoryPoint, range: ChartRange) {
  const date = new Date(point.t)
  if (range === '1d') return `${timeFormatter.format(date)} Uhr`
  if (range === '1w') return `${weekdayTimeFormatter.format(date)} Uhr`
  return dateFormatter.format(date)
}

export function StockDetail({ stock, isFavorite, onToggleFavorite, onBack, backLabel, benchmark }: Props) {
  const [range, setRange] = useState<ChartRange>('3mo')
  const [scrubPoint, setScrubPoint] = useState<StockHistoryPoint | null>(null)
  const [showBenchmark, setShowBenchmark] = useState(false)

  const historyByRange: Record<ChartRange, typeof stock.history> = {
    '1d': stock.history1d ?? [],
    '1w': stock.history1w ?? [],
    '1mo': stock.history1mo ?? [],
    '3mo': stock.history ?? [],
    '1y': stock.history1y ?? [],
    '3y': stock.history3y ?? [],
    '5y': stock.history5y ?? [],
  }
  const activeHistory = historyByRange[range]
  const hasHistory = activeHistory.length >= 2

  const benchmarkHistory = benchmark
    ? ({
        '1d': benchmark.history1d,
        '1w': benchmark.history1w,
        '1mo': benchmark.history1mo,
        '3mo': benchmark.history,
        '1y': benchmark.history1y,
        '3y': benchmark.history3y,
        '5y': benchmark.history5y,
      } satisfies Record<ChartRange, StockHistoryPoint[]>)[range]
    : []
  const hasBenchmark = benchmarkHistory.length >= 2
  const benchmarkChangePct = hasBenchmark
    ? ((benchmarkHistory[benchmarkHistory.length - 1].c - benchmarkHistory[0].c) / benchmarkHistory[0].c) * 100
    : null

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

  const displayPrice = scrubPoint ? scrubPoint.c : stock.price
  const displayChangePct =
    scrubPoint && activeHistory.length > 0
      ? ((scrubPoint.c - activeHistory[0].c) / activeHistory[0].c) * 100
      : changePct
  const animatedPrice = useCountUp(displayPrice)
  const animatedChangePct = useCountUp(displayChangePct)

  useEffect(() => {
    setScrubPoint(null)
  }, [stock.symbol])

  function handleRangeChange(next: ChartRange) {
    setRange(next)
    setScrubPoint(null)
  }

  return (
    <div className="mx-auto max-w-xl animate-[fade-slide-in_0.35s_ease-out]">
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
            {formatPrice(animatedPrice, stock.currency)}
          </span>
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${positive ? 'bg-up' : 'bg-down'}`}
            />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${positive ? 'bg-up' : 'bg-down'}`} />
          </span>
          <StatBadge changePct={animatedChangePct} />
        </div>
        <p className="mt-1 h-[18px] text-[13px] text-black/45 dark:text-white/45">
          {scrubPoint ? formatPointLabel(scrubPoint, range) : ' '}
        </p>

        <div className="mt-2 h-56 w-full">
          {hasHistory ? (
            <InteractiveChart
              history={activeHistory}
              positive={positive}
              responsive
              width={400}
              height={160}
              onScrub={setScrubPoint}
              compareHistory={showBenchmark && hasBenchmark ? benchmarkHistory : undefined}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[14px] text-black/35 dark:text-white/35">
              Keine Daten für diesen Zeitraum
            </div>
          )}
        </div>

        {benchmark && (
          <button
            type="button"
            onClick={() => setShowBenchmark((v) => !v)}
            disabled={!hasBenchmark}
            aria-pressed={showBenchmark}
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors disabled:opacity-40 ${
              showBenchmark
                ? 'border-transparent bg-black text-white dark:bg-white dark:text-black'
                : 'border-black/10 text-black/55 dark:border-white/15 dark:text-white/55'
            }`}
          >
            <span
              className={`inline-block h-0 w-3 border-t-2 border-dashed ${showBenchmark ? 'border-white dark:border-black' : 'border-black/40 dark:border-white/40'}`}
            />
            {benchmark.name}
            {showBenchmark && hasBenchmark && benchmarkChangePct !== null
              ? ` ${pctFormatter.format(benchmarkChangePct)}%`
              : ''}
          </button>
        )}

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
              onClick={() => handleRangeChange(r)}
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
