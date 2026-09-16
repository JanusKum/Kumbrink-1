interface Props {
  changePct: number
}

const pctFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'always',
})

export function StatBadge({ changePct }: Props) {
  const positive = changePct >= 0

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-[13px] font-semibold tabular-nums ${
        positive
          ? 'bg-up/15 text-up'
          : 'bg-down/15 text-down'
      }`}
    >
      {positive ? '▲' : '▼'} {pctFormatter.format(changePct)}%
    </span>
  )
}
