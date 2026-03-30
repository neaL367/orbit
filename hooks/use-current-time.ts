import { useState, useEffect } from "react"
import { getUnixTime } from 'date-fns'


export function useCurrentTime() {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    // Set initial time on client mount immediately
    setNow(getUnixTime(new Date()))

    const interval = setInterval(() => {
      setNow(getUnixTime(new Date()))
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  return now
}
