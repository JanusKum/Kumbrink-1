import { SkeletonBlock } from './SkeletonBlock'

export function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
      <SkeletonBlock className="h-8 w-40" />
      <SkeletonBlock className="mt-2 h-4 w-56" />

      <div className="mt-6 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-32" />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBlock className="h-20 w-20 shrink-0" />
            <div className="flex-1">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="mt-2 h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
