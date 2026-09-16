interface Props {
  updatedAt: string
  universeSize: number
}

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function UpdatedFooter({ updatedAt, universeSize }: Props) {
  const formatted = dateFormatter.format(new Date(updatedAt))

  return (
    <footer className="mx-auto max-w-xl px-4 py-8 text-center text-[12px] leading-relaxed text-black/40 dark:text-white/40">
      <p>
        Zuletzt aktualisiert am {formatted} Uhr · Basis: {universeSize} Aktien
      </p>
      <p className="mt-1">
        Kursdaten von Yahoo Finance, unverbindlich, ohne Gewähr. Keine
        Anlageberatung.
      </p>
    </footer>
  )
}
