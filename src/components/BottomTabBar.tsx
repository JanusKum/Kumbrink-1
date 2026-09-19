export type MainTab = 'home' | 'top50' | 'valuable' | 'sectors'

interface Props {
  active: MainTab
  onChange: (tab: MainTab) => void
}

const TABS: { id: MainTab; label: string; icon: JSX.Element }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <path
        d="M4 10l7-6 7 6v7a1 1 0 01-1 1h-4v-5H9v5H5a1 1 0 01-1-1v-7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: 'top50',
    label: 'Top 50',
    icon: (
      <path
        d="M3 15l4.5-5 3 3L18 5M18 5h-4M18 5v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: 'valuable',
    label: 'Wertvollste',
    icon: (
      <path
        d="M4 8l3-4h6l3 4-6 9-6-9zM4 8h12M10 4v13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: 'sectors',
    label: 'Branchen',
    icon: (
      <>
        <rect x="3.5" y="3.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.8" />
        <rect x="12.5" y="3.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3.5" y="12.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.8" />
        <rect x="12.5" y="12.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
  },
]

export function BottomTabBar({ active, onChange }: Props) {
  return (
    <nav
      role="tablist"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-black/[0.06] bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-black/80"
    >
      <div className="mx-auto flex max-w-xl">
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-black dark:text-white'
                  : 'text-black/40 dark:text-white/40'
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                {tab.icon}
              </svg>
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
