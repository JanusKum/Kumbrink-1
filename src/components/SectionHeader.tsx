interface Props {
  title: string
  subtitle?: string
  onBack?: () => void
  backLabel?: string
}

export function SectionHeader({ title, subtitle, onBack, backLabel }: Props) {
  return (
    <header className="sticky top-0 z-10 -mx-4 px-4 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-3 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-black/[0.06] dark:border-white/[0.08]">
      <div className="mx-auto max-w-xl">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="-ml-2 mb-1 flex items-center gap-0.5 rounded-full py-1.5 pl-2 pr-3 text-[15px] text-black/50 hover:bg-black/[0.05] dark:text-white/50 dark:hover:bg-white/[0.08]"
          >
            <svg width="9" height="15" viewBox="0 0 11 18" fill="none">
              <path
                d="M9.5 1.5L1.5 9l8 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {backLabel}
          </button>
        )}
        <h1 className="text-[32px] sm:text-[34px] font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-[15px] text-black/50 dark:text-white/50">{subtitle}</p>
        )}
      </div>
    </header>
  )
}
