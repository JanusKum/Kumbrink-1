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
  history: StockHistoryPoint[]
}

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
