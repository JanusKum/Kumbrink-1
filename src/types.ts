export interface StockHistoryPoint {
  /** ISO date, e.g. 2026-06-16 */
  t: string
  /** Close price */
  c: number
}

export interface Stock {
  rank: number
  symbol: string
  name: string
  sector: string
  currency: string
  price: number
  changePct3mo: number
  changeAbs3mo: number
  startPrice: number
  /** 3-Monats-Historie, verwendet für die Sparkline in der Liste und als Ranking-Basis. */
  history: StockHistoryPoint[]
  /** Zusätzliche Zeiträume für die Detailansicht (nur für die finalen Top 50 geladen). */
  history1mo: StockHistoryPoint[]
  history1y: StockHistoryPoint[]
}

export type ChartRange = '1mo' | '3mo' | '1y'

export interface Top50Data {
  updatedAt: string
  period: string
  universeSize: number
  source: {
    universe: string
    prices: string
  }
  stocks: Stock[]
}
