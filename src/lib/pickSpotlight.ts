import type { Stock } from '../types'
import { pickRandom } from './pickRandom'

/**
 * Picks stocks for the home screen spotlight: always includes the week's
 * single most dramatic mover (up or down) so there's a guaranteed headline,
 * then fills the rest randomly from the same big-movers pool.
 */
export function pickSpotlight(stocks: Stock[], count: number): Stock[] {
  if (stocks.length <= count) return stocks

  const bySwing = [...stocks].sort(
    (a, b) => Math.abs(b.changePct1w ?? 0) - Math.abs(a.changePct1w ?? 0),
  )
  const headline = bySwing[0]
  const rest = pickRandom(
    stocks.filter((s) => s.symbol !== headline.symbol),
    count - 1,
  )
  return pickRandom([headline, ...rest], count)
}
