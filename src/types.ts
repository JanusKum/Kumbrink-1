export interface StockHistoryPoint {
  /** ISO date, e.g. 2026-06-16 */
  t: string
  /** Close price */
  c: number
}

export type ChartRange = '1mo' | '3mo' | '1y'

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
  /** null when the large-cap lookup failed or the stock wasn't in the candidate pool. */
  marketCap: number | null
}

/** Chart history, only fetched for stocks shown in one of the ranked views. */
export interface StockDetailData {
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

export interface MarketData {
  updatedAt: string
  period: string
  universeSize: number
  source: {
    universe: string
    prices: string
    marketCap: string
  }
  stocksBySymbol: Record<string, StockSummary>
  /** Symbols, best 3-month performer first. */
  top50: string[]
  /** Symbols, highest market cap first. */
  top20ByMarketCap: string[]
  /** Strongest average 3-month performance first. */
  sectors: SectorSummary[]
  detail: Record<string, StockDetailData>
}
