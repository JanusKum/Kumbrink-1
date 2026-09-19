import type { SectorSummary } from '../types'
import { StatBadge } from './StatBadge'

interface Props {
  sector: SectorSummary
  rank: number
  onSelect: (name: string) => void
}

export function SectorRow({ sector, rank, onSelect }: Props) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(sector.name)}
        className="flex w-full items-center gap-3 sm:gap-4 rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
      >
        <span className="w-6 shrink-0 text-right text-sm font-medium tabular-nums text-black/35 dark:text-white/35">
          {rank}
        </span>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold leading-tight">{sector.name}</div>
          <div className="truncate text-[13px] leading-tight text-black/50 dark:text-white/50">
            {sector.stockCount} Aktien
          </div>
        </div>

        <StatBadge changePct={sector.avgChangePct3mo} />

        <svg
          width="7"
          height="12"
          viewBox="0 0 11 18"
          fill="none"
          className="shrink-0 text-black/20 dark:text-white/20"
        >
          <path
            d="M1.5 1.5L9.5 9l-8 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </li>
  )
}
