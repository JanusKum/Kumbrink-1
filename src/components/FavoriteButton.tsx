interface Props {
  active: boolean
  onToggle: () => void
  label: string
}

export function FavoriteButton({ active, onToggle, label }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={label}
      className="-ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/25 transition-colors hover:bg-black/[0.05] hover:text-black/40 dark:text-white/25 dark:hover:bg-white/[0.08] dark:hover:text-white/40"
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill={active ? '#f5a623' : 'none'}
        stroke={active ? '#f5a623' : 'currentColor'}
        strokeWidth="1.75"
        strokeLinejoin="round"
      >
        <path d="M12 3.5l2.62 5.53 6.03.72-4.45 4.16 1.18 5.98L12 16.98l-5.38 2.91 1.18-5.98-4.45-4.16 6.03-.72L12 3.5z" />
      </svg>
    </button>
  )
}
