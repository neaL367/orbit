// components/CountdownTimer.tsx
"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetTime: number; // Unix timestamp in seconds
}

export function CountdownTimer({ targetTime }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTime * 1000 - now);
      setTimeRemaining({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const { days, hours, minutes, seconds } = timeRemaining;
  if (days > 0) {
    return <span>{`${days}d ${hours}h`}</span>;
  } else if (hours > 0) {
    return <span>{`${hours}h ${minutes}m`}</span>;
  } else {
    return <span>{`${minutes}m ${seconds}s`}</span>;
  }
}
