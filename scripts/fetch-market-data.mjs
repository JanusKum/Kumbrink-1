#!/usr/bin/env node
// Fetches the current S&P 500 constituent list, pulls 3-month price
// history for every ticker from Yahoo Finance's public chart API, and
// derives several views from it: the 50 best performers, the strongest
// sectors (with their own top 10), and the 20 most valuable companies
// (from a manually curated, publicly known large-cap list — Yahoo's
// batched quote endpoint that would give live market-cap figures
// requires an auth crumb/cookie handshake it doesn't grant to plain
// requests, so we don't depend on it; every price and performance
// figure shown for these companies is still fetched live). Extra chart
// ranges (1 day, 1 week, 1 month, 1 year) are fetched only for the
// stocks that actually show up in one of these views. Designed to run on a
// schedule (GitHub Actions) so the published site always reflects real
// current data without any manual work or API key.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const UNIVERSE_CSV_URL =
  'https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.csv'
const FALLBACK_UNIVERSE_PATH = path.join(__dirname, 'universe-fallback.json')
const TOP_MARKET_CAP_PATH = path.join(__dirname, 'top20-market-cap.json')
const OUTPUT_PATH = path.join(ROOT, 'public', 'data', 'market.json')

const TOP_PERFORMERS_SIZE = 50
const TOP_PER_SECTOR_SIZE = 10
const TOP_SHORT_TERM_SIZE = 24
const RANGE = '3mo'
const CONCURRENCY = 8
const MIN_HISTORY_POINTS = 20
const REQUEST_TIMEOUT_MS = 15_000
const RETRIES_PER_TICKER = 2
const NEWS_ITEM_LIMIT = 12
// Public RSS feeds, no API key needed. Tried in order; the first one that
// yields items wins, so a single feed going down doesn't blank the section.
const NEWS_FEEDS = [
  'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114',
  'https://feeds.content.dowjones.io/public/rss/mw_topstories',
]

const USER_AGENT =
  'Mozilla/5.0 (compatible; ChartPulsBot/1.0; +https://github.com/JanusKum/Kumbrink-1)'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Minimal CSV parser that handles quoted fields with embedded commas. */
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.length > 1 || r[0] !== '')
}

/** Finds the first header column matching any of the given candidate names. */
function findColumn(header, candidates) {
  const normalized = header.map((h) => h.replace(/^﻿/, '').trim().toLowerCase())
  for (const candidate of candidates) {
    const idx = normalized.indexOf(candidate)
    if (idx !== -1) return idx
  }
  return -1
}

async function fetchUniverse() {
  try {
    const res = await fetch(UNIVERSE_CSV_URL, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    const rows = parseCsv(text)
    const [header, ...data] = rows
    const symbolIdx = findColumn(header, ['symbol', 'ticker'])
    const nameIdx = findColumn(header, ['name', 'security', 'company'])
    const sectorIdx = findColumn(header, ['sector', 'gics sector'])

    if (symbolIdx === -1 || nameIdx === -1) {
      throw new Error(`Unexpected CSV shape, header was: ${header.join(' | ')}`)
    }

    const universe = data
      .filter((r) => r[symbolIdx])
      .map((r) => ({
        symbol: r[symbolIdx].trim(),
        name: r[nameIdx].trim(),
        sector: sectorIdx !== -1 ? (r[sectorIdx] ?? '').trim() : 'Unbekannt',
      }))

    if (universe.length < 400) throw new Error(`Only got ${universe.length} rows, looks incomplete`)

    console.log(`Universum: ${universe.length} Aktien (live S&P 500 Liste)`)
    return { universe, source: UNIVERSE_CSV_URL }
  } catch (err) {
    console.warn(`Live-Universum konnte nicht geladen werden (${err.message}), nutze lokalen Fallback.`)
    const raw = await readFile(FALLBACK_UNIVERSE_PATH, 'utf-8')
    const universe = JSON.parse(raw)
    return { universe, source: 'local fallback list' }
  }
}

function toYahooSymbol(symbol) {
  // Yahoo uses '-' where index providers use '.' for share classes (BRK.B -> BRK-B)
  return symbol.replace(/\./g, '-')
}

// Yahoo's chart API returns a coarser bar size for short ranges than it
// would default to, so each range gets an explicit interval: fine-grained
// enough to draw a useful chart, coarse enough to stay well under Yahoo's
// per-range point limits.
const RANGE_INTERVAL = {
  '1d': '5m',
  '5d': '15m',
  '1mo': '1h',
  '3mo': '1d',
  '1y': '1d',
}

async function fetchHistory(symbol, range = RANGE) {
  const yahooSymbol = toYahooSymbol(symbol)
  const interval = RANGE_INTERVAL[range] ?? '1d'
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    yahooSymbol,
  )}?range=${range}&interval=${interval}&includePrePost=false`

  for (let attempt = 0; attempt <= RETRIES_PER_TICKER; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const result = json?.chart?.result?.[0]
      if (!result) throw new Error(json?.chart?.error?.description ?? 'Keine Daten')

      const timestamps = result.timestamp ?? []
      const closes = result.indicators?.quote?.[0]?.close ?? []
      const meta = result.meta ?? {}

      const points = timestamps
        .map((t, i) => ({ t, c: closes[i] }))
        .filter((p) => typeof p.c === 'number' && Number.isFinite(p.c))

      if (points.length < MIN_HISTORY_POINTS) throw new Error('Zu wenig Kursdaten')

      const startPrice = points[0].c
      const currentPrice =
        typeof meta.regularMarketPrice === 'number'
          ? meta.regularMarketPrice
          : points[points.length - 1].c

      return {
        startPrice,
        currentPrice,
        currency: meta.currency ?? 'USD',
        points,
      }
    } catch (err) {
      if (attempt === RETRIES_PER_TICKER) {
        return { error: err.message }
      }
      await sleep(500 * (attempt + 1))
    }
  }
  return { error: 'unreachable' }
}

function extractTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return m ? m[1] : null
}

function extractAttr(block, tag, attr) {
  const m = block.match(new RegExp(`<${tag}\\b[^>]*\\b${attr}=["']([^"']+)["']`, 'i'))
  return m ? m[1] : null
}

function stripCdata(s) {
  const m = s.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/)
  return (m ? m[1] : s).trim()
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
}

/** Minimal, tolerant RSS <item> extractor — regex-based rather than a full XML parser. */
function parseRssItems(xml) {
  const items = []
  const itemBlocks = xml.match(/<item\b[^>]*>[\s\S]*?<\/item>/gi) ?? []
  for (const block of itemBlocks) {
    const title = extractTag(block, 'title')
    const link = extractTag(block, 'link')
    const pubDate = extractTag(block, 'pubDate')
    const imageUrl =
      extractAttr(block, 'media:content', 'url') ??
      extractAttr(block, 'media:thumbnail', 'url') ??
      extractAttr(block, 'enclosure', 'url') ??
      null

    if (!title || !link) continue
    const publishedAt = pubDate && !Number.isNaN(Date.parse(pubDate)) ? new Date(pubDate).toISOString() : null

    items.push({
      title: decodeEntities(stripCdata(title)),
      url: decodeEntities(stripCdata(link)),
      imageUrl,
      publishedAt,
    })
  }
  return items
}

async function fetchNews() {
  for (const url of NEWS_FEEDS) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const xml = await res.text()
      const items = parseRssItems(xml).slice(0, NEWS_ITEM_LIMIT)
      if (items.length === 0) throw new Error('Keine Artikel im Feed gefunden')
      console.log(`News: ${items.length} Artikel von ${new URL(url).hostname} geladen.`)
      return items
    } catch (err) {
      console.warn(`News-Feed ${url} fehlgeschlagen: ${err.message}`)
    }
  }
  console.warn('Alle News-Feeds fehlgeschlagen, News-Sektion bleibt leer.')
  return []
}

/** Runs async tasks with a concurrency cap, preserving input order in the result array. */
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function run() {
    while (nextIndex < items.length) {
      const current = nextIndex++
      results[current] = await worker(items[current], current)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run))
  return results
}

/** Samples history down to at most `max` points, always keeping first/last. */
function downsample(points, max = 40) {
  if (points.length <= max) return points
  const step = (points.length - 1) / (max - 1)
  const sampled = []
  for (let i = 0; i < max; i++) {
    sampled.push(points[Math.round(i * step)])
  }
  return sampled
}

/** Full ISO timestamp (not just the date) so intraday points stay distinguishable. */
function toIsoTimestamp(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString()
}

function round2(n) {
  return Math.round(n * 100) / 100
}

/** % change over the last `n` trading days, using points already fetched for the 3mo ranking. */
function changeOverLastNPoints(points, n) {
  if (points.length < n + 1) return null
  const end = points[points.length - 1].c
  const start = points[points.length - 1 - n].c
  if (!start) return null
  return round2(((end - start) / start) * 100)
}

async function main() {
  const startedAt = Date.now()
  const { universe, source } = await fetchUniverse()

  let ok = 0
  let failed = 0

  const results = await mapWithConcurrency(universe, CONCURRENCY, async (stock) => {
    const history = await fetchHistory(stock.symbol)
    if (history.error) {
      failed++
      return null
    }
    ok++
    const changeAbs3mo = history.currentPrice - history.startPrice
    const changePct3mo = (changeAbs3mo / history.startPrice) * 100

    return {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      currency: history.currency,
      price: round2(history.currentPrice),
      startPrice3mo: round2(history.startPrice),
      changeAbs3mo: round2(changeAbs3mo),
      changePct3mo: round2(changePct3mo),
      changePct3d: changeOverLastNPoints(history.points, 3),
      changePct1w: changeOverLastNPoints(history.points, 5),
      _points3mo: history.points,
    }
  })

  const valid = results.filter(Boolean)
  console.log(`Fertig: ${ok} ok, ${failed} fehlgeschlagen (3-Monats-Kurse).`)

  // --- Top 50 nach Performance ---
  const byPerformance = [...valid].sort((a, b) => b.changePct3mo - a.changePct3mo)
  const top50 = byPerformance.slice(0, TOP_PERFORMERS_SIZE).map((s) => s.symbol)

  // --- Branchen: Durchschnittsperformance + Top 10 je Branche ---
  const bySector = new Map()
  for (const stock of valid) {
    if (!bySector.has(stock.sector)) bySector.set(stock.sector, [])
    bySector.get(stock.sector).push(stock)
  }
  const sectors = [...bySector.entries()]
    .map(([name, stocks]) => {
      const avgChangePct3mo =
        stocks.reduce((sum, s) => sum + s.changePct3mo, 0) / stocks.length
      const top10 = [...stocks]
        .sort((a, b) => b.changePct3mo - a.changePct3mo)
        .slice(0, TOP_PER_SECTOR_SIZE)
        .map((s) => s.symbol)
      return { name, avgChangePct3mo: round2(avgChangePct3mo), stockCount: stocks.length, top10 }
    })
    .sort((a, b) => b.avgChangePct3mo - a.avgChangePct3mo)

  // --- Top 20 wertvollste ---
  // Yahoo's live Marktkapitalisierungs-Endpunkt verlangt eine Auth-Crumb, die
  // wir nicht besitzen (getestet: HTTP 401 auf jede Anfrage). Statt uns auf
  // eine fragile Umgehung zu verlassen, nutzen wir eine manuell kuratierte,
  // öffentlich bekannte Liste der größten S&P-500-Unternehmen – Kurs und
  // Performance für diese Titel sind weiterhin zu 100% live geladen.
  const validBySymbol = new Map(valid.map((s) => [s.symbol, s]))
  const curatedRaw = await readFile(TOP_MARKET_CAP_PATH, 'utf-8')
  const curatedTop20 = JSON.parse(curatedRaw)
  const top20ByMarketCap = curatedTop20.filter((symbol) => validBySymbol.has(symbol))

  console.log(
    `Top 20 wertvollste: ${top20ByMarketCap.length}/${curatedTop20.length} aus der kuratierten Liste im aktuellen Universum gefunden.`,
  )

  // --- Größte Kursbewegungen der Woche (für die Startseite) ---
  // Bewusst nach Betrag sortiert statt nur nach Gewinnern: starke Verlierer
  // sind für einen Marktüberblick genauso interessant wie starke Gewinner,
  // und eine gemischte Auswahl wirkt weniger beliebig als reine Zufallspicks
  // aus einem Pool, der ohnehin nur eine Richtung kennt.
  const topShortTerm = [...valid]
    .filter((s) => typeof s.changePct1w === 'number')
    .sort((a, b) => Math.abs(b.changePct1w) - Math.abs(a.changePct1w))
    .slice(0, TOP_SHORT_TERM_SIZE)
    .map((s) => s.symbol)

  // --- News-Feed (öffentliche RSS-Feeds, kein API-Key) ---
  const news = await fetchNews()

  // --- Zusätzliche Zeiträume (1M, 1J) nur für Aktien, die irgendwo auftauchen ---
  const detailSymbols = new Set([
    ...top50,
    ...top20ByMarketCap,
    ...sectors.flatMap((s) => s.top10),
    ...topShortTerm,
  ])
  console.log(`Lade zusätzliche Zeiträume (1D, 1W, 1M, 1J) für ${detailSymbols.size} Aktien …`)

  const detail = {}
  await mapWithConcurrency([...detailSymbols], CONCURRENCY, async (symbol) => {
    const stock = validBySymbol.get(symbol)
    if (!stock) return
    const [oneDay, fiveDay, oneMonth, oneYear] = await Promise.all([
      fetchHistory(symbol, '1d'),
      fetchHistory(symbol, '5d'),
      fetchHistory(symbol, '1mo'),
      fetchHistory(symbol, '1y'),
    ])
    const toPoints = (points, max) =>
      downsample(points, max).map((p) => ({ t: toIsoTimestamp(p.t), c: round2(p.c) }))
    detail[symbol] = {
      history1d: oneDay.error ? [] : toPoints(oneDay.points, 60),
      history1w: fiveDay.error ? [] : toPoints(fiveDay.points, 60),
      history: toPoints(stock._points3mo, 40),
      history1mo: oneMonth.error ? [] : toPoints(oneMonth.points, 40),
      history1y: oneYear.error ? [] : toPoints(oneYear.points, 40),
    }
  })

  // --- Ausgabe zusammenbauen ---
  const stocksBySymbol = {}
  for (const s of valid) {
    stocksBySymbol[s.symbol] = {
      symbol: s.symbol,
      name: s.name,
      sector: s.sector,
      currency: s.currency,
      price: s.price,
      startPrice3mo: s.startPrice3mo,
      changeAbs3mo: s.changeAbs3mo,
      changePct3mo: s.changePct3mo,
      changePct3d: s.changePct3d,
      changePct1w: s.changePct1w,
    }
  }

  const output = {
    updatedAt: new Date().toISOString(),
    period: RANGE,
    universeSize: universe.length,
    source: {
      universe: source,
      prices: 'Yahoo Finance chart API (query1.finance.yahoo.com)',
      top20ByMarketCap: 'Manuell kuratierte Liste öffentlich bekannter Large Caps (scripts/top20-market-cap.json)',
      news: 'Öffentliche RSS-Feeds (CNBC, MarketWatch)',
    },
    stocksBySymbol,
    top50,
    top20ByMarketCap,
    sectors,
    topShortTerm,
    news,
    detail,
  }

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n', 'utf-8')

  const durationS = ((Date.now() - startedAt) / 1000).toFixed(1)
  console.log(`Fertig in ${durationS}s.`)
  console.log(
    'Top 5 Performer:',
    top50.slice(0, 5).map((sym) => `${sym} ${stocksBySymbol[sym].changePct3mo}%`).join(', '),
  )
  console.log('Stärkste Branche:', sectors[0]?.name, `(${sectors[0]?.avgChangePct3mo}%)`)
  console.log(`Größte Wochenbewegungen: ${topShortTerm.length}, News-Artikel: ${news.length}`)

  if (top50.length < TOP_PERFORMERS_SIZE) {
    console.warn(`Warnung: nur ${top50.length} von ${TOP_PERFORMERS_SIZE} Top-Performer-Plätzen befüllt.`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
