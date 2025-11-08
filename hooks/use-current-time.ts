import { getUnixTime } from 'date-fns'
import { useState, useEffect } from "react"

/**
 * Hook that returns the current Unix timestamp in seconds, updating every second
 * Useful for countdown timers and time-based calculations
 */
export function useCurrentTime() {
  const [now, setNow] = useState(() => getUnixTime(new Date()))
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getUnixTime(new Date()))
    }, 1000) // Update every second
    
    return () => clearInterval(interval)
  }, [])
  
  return now
}

