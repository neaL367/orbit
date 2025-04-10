"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { format, addDays, startOfWeek } from "date-fns";
import type { AiringSchedule, AnimeMedia } from "@/lib/types";

import SchedulePageLoading from "./loading";
import { WEEKLY_SCHEDULE_QUERY } from "@/app/graphql/queries/weekly-schedule";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PremiereCountdown } from "@/components/schedule/premiere-countdown";
import { ScheduleTabs } from "@/components/schedule/schedule-tabs";
import { ArrowLeft } from "lucide-react";
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
  [key: string]: ScheduleMetadata[];
}

// Custom hooks
function useWeekDays(weekOffset: number) {
  const today = useMemo(() => new Date(), []);
  return useMemo(() => {
    const weekStart = startOfWeek(addDays(today, weekOffset * 7), {
      weekStartsOn: 1,
    });

    return {
      weekStart,
      weekEnd: addDays(weekStart, 6),
      weekDays: Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        const dayName = format(date, "EEEE");
        const shortName = format(date, "EEE");
        const value = dayName.toLowerCase();
        const isToday =
          weekOffset === 0 && format(today, "EEEE").toLowerCase() === value;
        return { name: dayName, shortName, value, date, isToday };
      }),
      activeDay: format(today, "EEEE").toLowerCase(),
    };
  }, [weekOffset, today]);
}

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
      const difference = Math.max(0, targetTime - now);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  return timeRemaining;
}

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

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const upcomingPremieres = allSchedules
        .filter((s) => s.episode === 1 && s.airingAt > currentTimestamp)
        .sort((a, b) => a.airingAt - b.airingAt)
        .slice(0, 5);

      setPremieres(upcomingPremieres);
      setCurrentPremiereIndex(0);
    }
  }, [data]);

  return {
    premieres,
    currentPremiereIndex,
    setCurrentPremiereIndex,
    currentPremiere: premieres[currentPremiereIndex] || {
      media: {
        title: { english: "Loading...", romaji: "Loading..." },
        coverImage: { large: "" },
        format: "",
      },
      episode: 0,
      airingAt: 0,
      id: 0,
    },
  };
}

function useWeeklySchedule(data: {
  Page?: { airingSchedules?: AiringSchedule[] };
}) {
  return useMemo(() => {
    const weeklySchedule: WeeklyScheduleData = {};

    if (data?.Page?.airingSchedules) {
      data.Page.airingSchedules
        .filter((schedule) => !schedule.media.isAdult) 
        .forEach((schedule: AiringSchedule) => {
          const scheduleDate = new Date(schedule.airingAt * 1000);
          const dayKey = format(scheduleDate, "EEEE").toLowerCase();

          if (!weeklySchedule[dayKey]) {
            weeklySchedule[dayKey] = [];
          }

          weeklySchedule[dayKey].push({
            id: schedule.id,
            airingAt: schedule.airingAt,
            episode: schedule.episode,
            media: schedule.media,
          });
        });
    }

    return weeklySchedule;
  }, [data]);
}

// Main component
export default function SchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { weekStart, weekEnd, weekDays, activeDay } = useWeekDays(weekOffset);

  // Calculate query variables
  const airingAtGreater = Math.floor(weekStart.getTime() / 1000);
  const airingAtLesser = Math.floor(addDays(weekEnd, 1).getTime() / 1000) - 1;

  // Query data
  const { data, loading, error } = useQuery(WEEKLY_SCHEDULE_QUERY, {
    variables: {
      airingAtGreater,
      airingAtLesser,
      page: 1,
      perPage: 50,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-first",
  });

  // Process data with custom hooks
  const weeklySchedule = useWeeklySchedule(data);
  const {
    premieres,
    currentPremiereIndex,
    setCurrentPremiereIndex,
    currentPremiere,
  } = usePremieres(data);
  const timeRemaining = useCountdown(currentPremiere.airingAt);

  if (loading) {
    return <SchedulePageLoading />;
  }
  if (error) {
    return (
      <div className="">
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
    <div className="">
      <div className="mb-8 flex items-center gap-4">
        <Navigator />
        <h1 className="text-2xl font-bold text-white">Anime Schedule</h1>
      </div>

      {premieres.length > 0 && (
        <PremiereCountdown
          premieres={premieres}
          currentPremiereIndex={currentPremiereIndex}
          setCurrentPremiereIndex={setCurrentPremiereIndex}
          currentPremiere={currentPremiere}
          timeRemaining={timeRemaining}
        />
      )}

      <ScheduleTabs
        weekDays={weekDays}
        activeDay={activeDay}
        weeklySchedule={weeklySchedule}
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
      />
    </div>
  );
}
