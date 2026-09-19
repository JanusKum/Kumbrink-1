import { useEffect, useRef, useState } from 'react'

/** Animates smoothly from the previously rendered value to `target` whenever it changes. */
export function useCountUp(target: number, durationMs = 450): number {
  const [value, setValue] = useState(target)
  const currentRef = useRef(target)

  useEffect(() => {
    const from = currentRef.current
    if (from === target) return

    const start = performance.now()
    let raf: number

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs)
      const eased = 1 - (1 - progress) ** 3
      const next = from + (target - from) * eased
      currentRef.current = next
      setValue(next)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return value
}
