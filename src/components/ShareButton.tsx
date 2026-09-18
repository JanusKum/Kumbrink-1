import { useState } from 'react'

interface Props {
  title: string
  text: string
  url: string
}

export function ShareButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false)

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard unavailable (e.g. no permission) – nothing more we can do.
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        await copyToClipboard()
      }
    } else {
      await copyToClipboard()
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        aria-label="Aktie teilen"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/[0.05] hover:text-black/60 dark:text-white/40 dark:hover:bg-white/[0.08] dark:hover:text-white/60"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 16V4M12 4L7 9M12 4l5 5" />
          <path d="M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5" />
        </svg>
      </button>

      {copied && (
        <span className="pointer-events-none absolute -bottom-8 right-0 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[11px] text-white dark:bg-white/90 dark:text-black">
          Link kopiert
        </span>
      )}
    </div>
  )
}
