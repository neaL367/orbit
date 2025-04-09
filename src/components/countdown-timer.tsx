"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetTime: number; // Unix timestamp in seconds
  duration?: number; // Duration in minutes, optional
  onStatusChange?: (status: TimerStatus) => void; // Callback to notify parent of status changes
}

export enum TimerStatus {
  UPCOMING = "upcoming",
  LIVE = "live",
  FINISHED = "finished",
}

export function CountdownTimer({
  targetTime,
  duration = 24,
  onStatusChange,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.UPCOMING);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now() / 1000; // Current time in seconds

      // Calculate the end time of the anime (start time + duration)
      // If no duration specified, default to 24 minutes as a fallback
      const endTime = targetTime + (duration || 24) * 60;

      // Determine status based on current time in relation to airing time
      let newStatus: TimerStatus;
      if (now >= targetTime && now < endTime) {
        // Currently airing
        newStatus = TimerStatus.LIVE;
      } else if (now >= endTime) {
        // Finished airing
        newStatus = TimerStatus.FINISHED;
      } else {
        // Not yet aired
        newStatus = TimerStatus.UPCOMING;
      }

      // Update status if changed
      if (newStatus !== status) {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      }

      // Calculate time remaining until airing starts (only for upcoming shows)
      if (now < targetTime) {
        const diff = targetTime * 1000 - now * 1000;
        setTimeRemaining({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTime, duration, status, onStatusChange]);

  const { days, hours, minutes, seconds } = timeRemaining;

  // Different display based on status
  if (status === TimerStatus.LIVE) {
    return <span className="animate-pulse text-white font-bold">LIVE NOW</span>;
  } else if (status === TimerStatus.FINISHED) {
    return <span className="text-gray-300">AIRED</span>;
  } else {
    if (days > 0) {
      return <span>{`${days}d ${hours}h`}</span>;
    } else if (hours > 0) {
      return <span>{`${hours}h ${minutes}m`}</span>;
    } else {
      return <span>{`${minutes}m ${seconds}s`}</span>;
    }
  }
}
