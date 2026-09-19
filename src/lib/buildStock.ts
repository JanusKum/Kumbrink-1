import type { MarketData, Stock, StockDetailData } from '../types'

const EMPTY_DETAIL: StockDetailData = { history: [], history1mo: [], history1y: [] }

/** Merges a stock's base data with its chart history (if loaded) into the UI's view-model. */
export function buildStock(data: MarketData, symbol: string, rank: number): Stock | undefined {
  const summary = data.stocksBySymbol[symbol]
  if (!summary) return undefined
  const detail = data.detail[symbol] ?? EMPTY_DETAIL
  return { ...summary, ...detail, rank }
}

/** Builds an ordered list of merged Stock view-models from a list of symbols (rank = position + 1). */
export function buildStockList(data: MarketData, symbols: string[]): Stock[] {
  return symbols
    .map((symbol, i) => buildStock(data, symbol, i + 1))
    .filter((s): s is Stock => s !== undefined)
}
