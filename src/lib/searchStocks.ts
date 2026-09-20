import type { MarketData, Stock } from '../types'
import { buildStock } from './buildStock'

const RESULT_LIMIT = 30

/** Lower score = better match. -1 means no match. */
function matchScore(query: string, symbol: string, name: string): number {
  if (symbol === query) return 0
  if (symbol.startsWith(query)) return 1
  if (name.startsWith(query)) return 2
  if (symbol.includes(query)) return 3
  if (name.includes(query)) return 4
  return -1
}

/**
 * Searches every stock in the S&P 500 universe (not just the currently
 * displayed list), ranked by relevance. Every result has at least a
 * 3-month chart, since `detail` now covers the full universe.
 */
export function searchStocks(data: MarketData, query: string): Stock[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const matches = Object.values(data.stocksBySymbol)
    .map((s) => ({ symbol: s.symbol, score: matchScore(q, s.symbol.toLowerCase(), s.name.toLowerCase()) }))
    .filter((s) => s.score >= 0)
    .sort((a, b) => a.score - b.score || a.symbol.localeCompare(b.symbol))
    .slice(0, RESULT_LIMIT)

  return matches
    .map(({ symbol }, i) => buildStock(data, symbol, i + 1))
    .filter((s): s is Stock => s !== undefined)
}
