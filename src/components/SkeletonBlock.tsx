interface Props {
  className?: string
}

export function SkeletonBlock({ className = '' }: Props) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-black/[0.06] dark:bg-white/[0.08] ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent dark:via-white/[0.14]" />
    </div>
  )
}
