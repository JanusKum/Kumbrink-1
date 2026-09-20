import { useId, useMemo, useRef, useState } from 'react'
import type { StockHistoryPoint } from '../types'

interface Props {
  history: StockHistoryPoint[]
  positive: boolean
  width?: number
  height?: number
  /** Stretches the SVG to fill its container instead of a fixed pixel size. */
  responsive?: boolean
  /** Called with the point under the pointer while scrubbing, or null once released. */
  onScrub?: (point: StockHistoryPoint | null) => void
  /** Optional second series (e.g. an index), drawn as a dashed reference line on the same relative scale. */
  compareHistory?: StockHistoryPoint[]
}

function toPath(coords: ReadonlyArray<readonly [number, number]>) {
  return coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

/** Like Sparkline, but draggable/tappable so a point's price and time can be read off. */
export function InteractiveChart({
  history,
  positive,
  width = 400,
  height = 160,
  responsive = false,
  onScrub,
  compareHistory,
}: Props) {
  const gradientId = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const [scrubIndex, setScrubIndex] = useState<number | null>(null)

  const { linePath, areaPath, points, comparePath } = useMemo(() => {
    if (history.length < 2) {
      return {
        linePath: '',
        areaPath: '',
        points: [] as Array<readonly [number, number]>,
        comparePath: '',
      }
    }

    // Both series are converted to "% change from their own first point" so
    // a stock's price and an index's much larger value share one scale -
    // this is a pure linear rescale, so it doesn't change the single-line
    // chart's shape at all when there's no comparison series.
    const toPct = (series: StockHistoryPoint[]) => {
      const base = series[0].c
      return series.map((p) => ((p.c - base) / base) * 100)
    }

    const stockPct = toPct(history)
    const comparePct = compareHistory && compareHistory.length >= 2 ? toPct(compareHistory) : null

    const allValues = comparePct ? [...stockPct, ...comparePct] : stockPct
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const range = max - min || 1

    const toCoords = (values: number[]) =>
      values.map((v, i) => {
        const x = (i / (values.length - 1)) * width
        const y = height - ((v - min) / range) * height
        return [x, y] as const
      })

    const points = toCoords(stockPct)
    const line = toPath(points)
    const area = `${line} L${width},${height} L0,${height} Z`
    const comparePath = comparePct ? toPath(toCoords(comparePct)) : ''

    return { linePath: line, areaPath: area, points, comparePath }
  }, [history, compareHistory, width, height])

  if (!linePath) return <div style={responsive ? undefined : { width, height }} />

  const color = positive ? '#30d158' : '#ff453a'

  function updateScrub(clientX: number) {
    const svg = svgRef.current
    if (!svg || points.length === 0) return
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0) return
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const index = Math.round(ratio * (points.length - 1))
    setScrubIndex(index)
    onScrub?.(history[index])
  }

  function endScrub() {
    setScrubIndex(null)
    onScrub?.(null)
  }

  const activePoint = scrubIndex !== null ? points[scrubIndex] : null

  return (
    <svg
      ref={svgRef}
      width={responsive ? '100%' : width}
      height={responsive ? '100%' : height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="touch-none select-none overflow-visible"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        updateScrub(e.clientX)
      }}
      onPointerMove={(e) => updateScrub(e.clientX)}
      onPointerUp={endScrub}
      onPointerLeave={endScrub}
      onPointerCancel={endScrub}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {comparePath && (
        <path
          d={comparePath}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          strokeLinecap="round"
          className="text-black/40 dark:text-white/40 animate-[fade-in_0.5s_ease-out]"
        />
      )}
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
        stroke="none"
        className="animate-[fade-in_0.5s_ease-out]"
      />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="animate-[chart-draw-in_0.7s_ease-out]"
      />
      {activePoint && (
        <g className="pointer-events-none">
          <line
            x1={activePoint[0]}
            y1={0}
            x2={activePoint[0]}
            y2={height}
            stroke={color}
            strokeOpacity={0.35}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <circle cx={activePoint[0]} cy={activePoint[1]} r={5} fill={color} stroke="white" strokeWidth={1.5} />
        </g>
      )}
    </svg>
  )
}
