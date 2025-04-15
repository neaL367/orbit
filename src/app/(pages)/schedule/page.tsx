"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { format, addDays } from "date-fns";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { AiringSchedule, AnimeMedia, MediaFormat } from "@/lib/types";

import SchedulePageLoading from "./loading";
import { WEEKLY_SCHEDULE_QUERY } from "@/app/graphql/queries/weekly-schedule";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PremiereCountdown } from "@/components/schedule/premiere-countdown";
import { ScheduleTabs } from "@/components/schedule/schedule-tabs";
import { Navigator } from "@/components/navigator";

export interface WeekDay {
  name: string;
  shortName: string;
  value: string;
  date: Date;
  isToday: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface ScheduleMetadata {
  id: number;
  airingAt: number;
  episode: number;
  media: AnimeMedia;
}

interface WeeklyScheduleData {
  [day: string]: ScheduleMetadata[];
}

/**
 * Hook for computing weekdays for a given week offset.
 */
function useWeekDays(weekOffset: number) {
  // Use a memoized "today" so that it remains consistent during the render cycle.
  const today = useMemo(() => new Date(), []);
  const weekStart = addDays(today, weekOffset * 7);

  const weekDays: WeekDay[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const dayName = format(date, "EEEE"); // e.g. "Friday"
      const shortName = format(date, "EEE"); // e.g. "Fri"
      const value = dayName.toLowerCase();
      const isToday =
        format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");

      return { name: dayName, shortName, value, date, isToday };
    });
  }, [weekStart, today]);

  return {
    weekStart,
    weekEnd: addDays(weekStart, 6),
    weekDays,
    activeDay: format(today, "EEEE").toLowerCase(),
  };
}

/**
 * Custom countdown hook that updates every second.
 */
function useCountdown(targetTimestamp: number) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const targetTime = targetTimestamp * 1000;
      const diff = Math.max(0, targetTime - now);

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
  }, [targetTimestamp]);

  return timeRemaining;
}

/**
 * Custom hook to compute upcoming premieres.
 */
function usePremieres(data: { Page?: { airingSchedules?: AiringSchedule[] } }) {
  const [premieres, setPremieres] = useState<ScheduleMetadata[]>([]);
  const [currentPremiereIndex, setCurrentPremiereIndex] = useState(0);

  useEffect(() => {
    if (data?.Page?.airingSchedules) {
      const allSchedules: ScheduleMetadata[] = data.Page.airingSchedules.map(
        (s: AiringSchedule) => ({
          id: s.id,
          airingAt: s.airingAt,
          episode: s.episode,
          media: s.media,
        })
      );

      const nowTimestamp = Math.floor(Date.now() / 1000);
      const upcomingPremieres = allSchedules
        .filter((s) => s.episode === 1 && s.airingAt > nowTimestamp)
        .sort((a, b) => a.airingAt - b.airingAt)
        .slice(0, 5);

      setPremieres(upcomingPremieres);
      setCurrentPremiereIndex(0);
    }
  }, [data]);

  // Provide a fallback premiere if none is available.
  const defaultPremiere: ScheduleMetadata = {
    id: 0,
    airingAt: 0,
    episode: 0,
    media: {
      id: 0,
      title: { english: "Loading...", romaji: "Loading..." },
      coverImage: { large: "" },
      format: "" as MediaFormat,
    },
  };

  return {
    premieres,
    currentPremiereIndex,
    setCurrentPremiereIndex,
    currentPremiere: premieres[currentPremiereIndex] || defaultPremiere,
  };
}

/**
 * Custom hook to group the schedules by day.
 */
function useWeeklySchedule(data: {
  Page?: { airingSchedules?: AiringSchedule[] };
}): WeeklyScheduleData {
  return useMemo(() => {
    if (!data?.Page?.airingSchedules) return {};

    return data.Page.airingSchedules
      .filter((schedule) => !schedule.media.isAdult)
      .reduce((acc: WeeklyScheduleData, schedule: AiringSchedule) => {
        const scheduleDate = new Date(schedule.airingAt * 1000);
        const dayKey = format(scheduleDate, "EEEE").toLowerCase();

        const scheduleData: ScheduleMetadata = {
          id: schedule.id,
          airingAt: schedule.airingAt,
          episode: schedule.episode,
          media: schedule.media,
        };

        acc[dayKey] = acc[dayKey]
          ? [...acc[dayKey], scheduleData]
          : [scheduleData];
        return acc;
      }, {});
  }, [data]);
}

/**
 * Main schedule page component.
 */
export default function SchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { weekStart, weekEnd, weekDays, activeDay } = useWeekDays(weekOffset);

  // Calculate Unix timestamps for query variables
  const airingAtGreater = Math.floor(weekStart.getTime() / 1000);
  const airingAtLesser = Math.floor(addDays(weekEnd, 1).getTime() / 1000) - 1;

  const { data, loading, error } = useQuery(WEEKLY_SCHEDULE_QUERY, {
    variables: { airingAtGreater, airingAtLesser, page: 1, perPage: 50 },
    fetchPolicy: "cache-first",
  });

  const weeklySchedule = useWeeklySchedule(data);
  const {
    premieres,
    currentPremiereIndex,
    setCurrentPremiereIndex,
    currentPremiere,
  } = usePremieres(data);
  const timeRemaining = useCountdown(currentPremiere.airingAt);

  // Memoize navigation callbacks to avoid unnecessary re-renders.
  const goToPreviousWeek = useCallback(
    () => setWeekOffset((prev) => prev - 1),
    []
  );
  const goToNextWeek = useCallback(() => setWeekOffset((prev) => prev + 1), []);
  const goToCurrentWeek = useCallback(() => setWeekOffset(0), []);

  if (loading) {
    return <SchedulePageLoading />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="rounded-full"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to home</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-white">Anime Schedule</h1>
        </div>
        <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-xl">
          <p className="text-lg font-medium">
            Error loading schedule: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <header className="mb-8 flex items-center gap-4">
        <Navigator />
        <h1 className="text-2xl font-bold text-white">Anime Schedule</h1>
      </header>

      {premieres.length > 0 && (
        <PremiereCountdown
          premieres={premieres}
          currentPremiereIndex={currentPremiereIndex}
          setCurrentPremiereIndex={setCurrentPremiereIndex}
          currentPremiere={currentPremiere}
          timeRemaining={timeRemaining}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h2>
          {weekOffset !== 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentWeek}
              className="text-xs"
            >
              Current Week
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousWeek}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Previous Week</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextWeek}
            className="h-8 w-8"
          >
            <ArrowRight className="h-4 w-4" />
            <span className="sr-only">Next Week</span>
          </Button>
        </div>
      </div>

      <ScheduleTabs
        weekDays={weekDays}
        activeDay={activeDay}
        weeklySchedule={weeklySchedule}
      />
    </div>
  );
}
