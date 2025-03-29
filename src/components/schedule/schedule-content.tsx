"use client";

import { useEffect, useState } from "react";
import CountdownBanner from "@/components/schedule/schedule-banner";
import ScheduleTabs from "./schedule-tabs";
import type { PremiereItem } from "@/anilist/modal/media";
import { ScheduleItem } from "@/anilist/modal/response";
import {
  fetchUpcomingPremieres,
  fetchWeeklySchedule,
} from "@/anilist/actions/schedule-actions";
import { XCircle } from "lucide-react";

export default function ScheduleContent() {
  const [weeklySchedule, setWeeklySchedule] = useState<
    Record<string, ScheduleItem[]>
  >({});
  const [upcomingPremieres, setUpcomingPremieres] = useState<PremiereItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNSFW, setShowNSFW] = useState(false);

  useEffect(() => {
    async function loadScheduleData() {
      setIsLoading(true);
      setError(null);

      try {
        // Use server actions to fetch data
        const [scheduleData, premieresData] = await Promise.all([
          fetchWeeklySchedule(showNSFW),
          fetchUpcomingPremieres(showNSFW),
        ]);

        setWeeklySchedule(scheduleData);
        setUpcomingPremieres(premieresData);
      } catch (err) {
        console.error("Error loading schedule data:", err);
        setError("Failed to load schedule data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadScheduleData();
  }, [showNSFW]); // Re-fetch when NSFW filter changes

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Re-trigger the effect
    setShowNSFW((prev) => prev);
  };

  if (error) {
    return <ErrorState message={error} retry={handleRetry} />;
  }

  return (
    <div className="space-y-8">
      {/* Premiere Countdown Banner */}
      {upcomingPremieres.length > 0 && (
        <CountdownBanner premieres={upcomingPremieres} />
      )}

      {/* Weekly Schedule Tabs */}
      <ScheduleTabs
        weeklySchedule={weeklySchedule}
        isLoading={isLoading}
        showNSFW={showNSFW}
        onNSFWChange={setShowNSFW}
      />
    </div>
  );
}

function ErrorState({
  message = "An error occurred while fetching data",
  retry,
}: {
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className=" flex flex-col items-center justify-center p-8 text-center">
      <XCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
