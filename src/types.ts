export interface StockHistoryPoint {
  /** Full ISO timestamp, e.g. 2026-06-16T14:30:00.000Z */
  t: string
  /** Close price */
  c: number
}

export type ChartRange = '1d' | '1w' | '1mo' | '3mo' | '1y'

/** Base fields available for every stock in the S&P-500 universe. */
export interface StockSummary {
  symbol: string
  name: string
  sector: string
  currency: string
  price: number
  startPrice3mo: number
  changeAbs3mo: number
  changePct3mo: number
  /** % change over the last 3 trading days, or null if not enough history. */
  changePct3d: number | null
  /** % change over the last 5 trading days (~1 week), or null if not enough history. */
  changePct1w: number | null
}

/** Chart history, only fetched for stocks shown in one of the ranked views. */
export interface StockDetailData {
  history1d: StockHistoryPoint[]
  history1w: StockHistoryPoint[]
  history: StockHistoryPoint[]
  history1mo: StockHistoryPoint[]
  history1y: StockHistoryPoint[]
}

/** Merged view-model used by the UI: a summary plus its rank in the current list plus chart data. */
export interface Stock extends StockSummary, StockDetailData {
  rank: number
}

export interface SectorSummary {
  name: string
  avgChangePct3mo: number
  stockCount: number
  /** Symbols, best performer first. */
  top10: string[]
}

export interface NewsItem {
  title: string
  url: string
  imageUrl: string | null
  /** ISO timestamp, or null if the feed didn't provide a parseable date. */
  publishedAt: string | null
}

export interface MarketData {
  updatedAt: string
  period: string
  universeSize: number
  source: {
    universe: string
    prices: string
    top20ByMarketCap: string
    news: string
    ipoNews?: string
  }
  stocksBySymbol: Record<string, StockSummary>
  /** Symbols, best 3-month performer first. */
  top50: string[]
  /** Symbols, from a manually curated large-cap list (see source.top20ByMarketCap). */
  top20ByMarketCap: string[]
  /** Strongest average 3-month performance first. */
  sectors: SectorSummary[]
  /** Symbols with the largest 1-week move (up or down) first — pool the home screen picks random cards from. */
  topShortTerm: string[]
  news: NewsItem[]
  /** Real headlines from the same news feeds, keyword-matched for IPO/going-public stories. */
  ipoNews: NewsItem[]
  detail: Record<string, StockDetailData>
}
