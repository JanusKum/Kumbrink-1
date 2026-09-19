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
}

/** Like Sparkline, but draggable/tappable so a point's price and time can be read off. */
export function InteractiveChart({
  history,
  positive,
  width = 400,
  height = 160,
  responsive = false,
  onScrub,
}: Props) {
  const gradientId = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const [scrubIndex, setScrubIndex] = useState<number | null>(null)

  const { linePath, areaPath, points } = useMemo(() => {
    if (history.length < 2) {
      return { linePath: '', areaPath: '', points: [] as Array<readonly [number, number]> }
    }

    const values = history.map((p) => p.c)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - ((v - min) / range) * height
      return [x, y] as const
    })

    const line = points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
      .join(' ')
    const area = `${line} L${width},${height} L0,${height} Z`

    return { linePath: line, areaPath: area, points }
  }, [history, width, height])

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
