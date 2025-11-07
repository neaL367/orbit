import { useState, useEffect } from "react"

/**
 * Hook that returns the current Unix timestamp in seconds, updating every second
 * Useful for countdown timers and time-based calculations
 */
export function useCurrentTime() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, 1000) // Update every second
    
    return () => clearInterval(interval)
  }, [])
  
  return now
}

