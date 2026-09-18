interface Props {
  sectors: string[]
  selected: string | null
  onChange: (sector: string | null) => void
}

export function SectorFilter({ sectors, selected, onChange }: Props) {
  if (sectors.length === 0) return null

  return (
    <div className="no-scrollbar -mx-4 mt-2.5 flex gap-1.5 overflow-x-auto px-4 pb-0.5">
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={selected === null}
        className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-[13px] font-medium transition-colors ${
          selected === null
            ? 'border-transparent bg-black text-white dark:bg-white dark:text-black'
            : 'border-black/10 text-black/60 dark:border-white/15 dark:text-white/60'
        }`}
      >
        Alle
      </button>
      {sectors.map((sector) => (
        <button
          key={sector}
          type="button"
          onClick={() => onChange(sector === selected ? null : sector)}
          aria-pressed={selected === sector}
          className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-[13px] font-medium transition-colors ${
            selected === sector
              ? 'border-transparent bg-black text-white dark:bg-white dark:text-black'
              : 'border-black/10 text-black/60 dark:border-white/15 dark:text-white/60'
          }`}
        >
          {sector}
        </button>
      ))}
    </div>
  )
}
