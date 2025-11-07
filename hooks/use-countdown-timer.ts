import { useState, useEffect, useRef } from "react"

export function useCountdownTimer(initialTimeUntilAiring: number) {
  const [timeUntilAiring, setTimeUntilAiring] = useState(() =>
    initialTimeUntilAiring <= 0 ? 0 : initialTimeUntilAiring,
  )
  const startTimeRef = useRef<number | null>(null)
  const initialTimeRef = useRef(initialTimeUntilAiring)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (initialTimeUntilAiring <= 0) {
      startTimeRef.current = null
      const timeoutId = setTimeout(() => {
        setTimeUntilAiring(0)
      }, 0)
      return () => clearTimeout(timeoutId)
    }

    initialTimeRef.current = initialTimeUntilAiring
    startTimeRef.current = Date.now()
    const timeoutId = setTimeout(() => {
      setTimeUntilAiring(initialTimeUntilAiring)
    }, 0)

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current === null) {
        return
      }
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const remaining = Math.max(0, initialTimeRef.current - elapsed)
      setTimeUntilAiring(remaining)

      if (remaining <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }, 1000)

    return () => {
      clearTimeout(timeoutId)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [initialTimeUntilAiring])

  return timeUntilAiring
}

