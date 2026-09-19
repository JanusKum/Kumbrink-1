import type { NewsItem, Stock } from '../types'
import { HomeMiniCard } from './HomeMiniCard'
import { NewsCard } from './NewsCard'
import { SectionHeader } from './SectionHeader'

interface Props {
  spotlightStocks: Stock[]
  news: NewsItem[]
  onSelectStock: (symbol: string) => void
}

export function HomeView({ spotlightStocks, news, onSelectStock }: Props) {
  return (
    <div className="min-h-screen">
      <SectionHeader title="ChartPuls" subtitle="Was den Markt diese Woche bewegt" />

      <main className="mx-auto max-w-xl px-4 pb-24 pt-2">
        {spotlightStocks.length > 0 && (
          <section className="grid grid-cols-2 gap-3">
            {spotlightStocks.map((stock) => (
              <HomeMiniCard key={stock.symbol} stock={stock} onSelect={onSelectStock} />
            ))}
          </section>
        )}

        {news.length > 0 && (
          <section className="mt-8">
            <h2 className="px-2 text-[13px] font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">
              Markt-News
            </h2>
            <div className="mt-2 flex flex-col divide-y divide-black/[0.05] dark:divide-white/[0.07]">
              {news.map((item) => (
                <NewsCard key={item.url} item={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
