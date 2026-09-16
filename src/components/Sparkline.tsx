import { useId, useMemo } from 'react'
import type { StockHistoryPoint } from '../types'

interface Props {
  history: StockHistoryPoint[]
  positive: boolean
  width?: number
  height?: number
  /** Stretches the SVG to fill its container instead of a fixed pixel size. */
  responsive?: boolean
}

export function Sparkline({
  history,
  positive,
  width = 96,
  height = 32,
  responsive = false,
}: Props) {
  const gradientId = useId()

  const { linePath, areaPath } = useMemo(() => {
    if (history.length < 2) return { linePath: '', areaPath: '' }

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

    return { linePath: line, areaPath: area }
  }, [history, width, height])

  if (!linePath) return <div style={responsive ? undefined : { width, height }} />

  const color = positive ? '#30d158' : '#ff453a'

  return (
    <svg
      width={responsive ? '100%' : width}
      height={responsive ? '100%' : height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
