import { getUnixTime } from 'date-fns'
import { useState, useEffect } from "react"


export function useCurrentTime() {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    // Set initial time on client mount
    setTimeout(() => {
      setNow(getUnixTime(new Date()))
    }, 0)

    const interval = setInterval(() => {
      setNow(getUnixTime(new Date()))
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  return now
}
