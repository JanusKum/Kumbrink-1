import type { NewsItem } from '../types'

interface Props {
  item: NewsItem
}

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export function NewsCard({ item }: Props) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 rounded-2xl p-2 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
    >
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          className="h-20 w-20 shrink-0 rounded-xl object-cover bg-black/[0.05] dark:bg-white/[0.08]"
        />
      ) : (
        <div className="h-20 w-20 shrink-0 rounded-xl bg-black/[0.05] dark:bg-white/[0.08]" />
      )}

      <div className="min-w-0 flex-1 py-0.5">
        <p className="line-clamp-3 text-[14px] font-semibold leading-snug">{item.title}</p>
        {item.publishedAt && (
          <p className="mt-1 text-[12px] text-black/40 dark:text-white/40">
            {dateFormatter.format(new Date(item.publishedAt))} Uhr
          </p>
        )}
      </div>
    </a>
  )
}
