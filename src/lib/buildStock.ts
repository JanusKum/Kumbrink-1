import type { MarketData, Stock, StockDetailData } from '../types'

const EMPTY_DETAIL: StockDetailData = {
  history1d: [],
  history1w: [],
  history: [],
  history1mo: [],
  history1y: [],
}

/** Merges a stock's base data with its chart history (if loaded) into the UI's view-model. */
export function buildStock(data: MarketData, symbol: string, rank: number): Stock | undefined {
  const summary = data.stocksBySymbol[symbol]
  if (!summary) return undefined
  const detail = data.detail[symbol] ?? EMPTY_DETAIL
  return { ...summary, ...detail, rank }
}

/**
 * Builds an ordered list of merged Stock view-models from a list of symbols
 * (rank = position + 1). Tolerates a missing/undefined symbol list so a
 * newer app bundle doesn't crash on a briefly stale cached market.json
 * (the PWA service worker can serve one while a fresh one loads).
 */
export function buildStockList(data: MarketData, symbols: string[] | undefined): Stock[] {
  return (symbols ?? [])
    .map((symbol, i) => buildStock(data, symbol, i + 1))
    .filter((s): s is Stock => s !== undefined)
}
