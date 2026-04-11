"use client";

import { Suspense, useMemo } from "react";
import { ScheduleView } from "./view";
import { ScheduleLoading } from "./loading";
import { useScheduleAnimeHeroQuery } from "@/lib/graphql/types/graphql";
import { CACHE_TIMES } from "@/lib/constants";
import type { AiringSchedule } from "@/lib/graphql/types/graphql";

function getDayRanges(): Array<{
  dayIndex: number;
  start: number;
  end: number;
}> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ranges: Array<{ dayIndex: number; start: number; end: number }> = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() + i);

    const start = new Date(dayDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(dayDate);
    end.setHours(23, 59, 59, 999);

    ranges.push({
      dayIndex: dayDate.getDay(),
      start: Math.floor(start.getTime() / 1000),
      end: Math.floor(end.getTime() / 1000),
    });
  }

  return ranges;
}

function ScheduleContent() {
  const dayRanges = useMemo(() => getDayRanges(), []);

  // Today's schedule requires two fetches (finished vs upcoming)
  const todayRange = dayRanges[0];
  const finishedToday = useScheduleAnimeHeroQuery(
    {
      page: 1,
      perPage: 50,
      notYetAired: false,
      airingAt_greater: todayRange.start,
      airingAt_lesser: todayRange.end,
    },
    { staleTime: CACHE_TIMES.MEDIUM }
  );

  const upcomingToday = useScheduleAnimeHeroQuery(
    {
      page: 1,
      perPage: 50,
      notYetAired: true,
      airingAt_greater: todayRange.start,
      airingAt_lesser: todayRange.end,
    },
    { staleTime: CACHE_TIMES.MEDIUM }
  );

  // Subsequent days only need upcoming
  const weekUpcoming = useScheduleAnimeHeroQuery(
    {
      page: 1,
      perPage: 100,
      notYetAired: true,
      airingAt_greater: dayRanges[0].start,
      airingAt_lesser: dayRanges[6].end,
    },
    { staleTime: CACHE_TIMES.MEDIUM }
  );

  const schedules = useMemo(() => {
    const finishedItems = finishedToday.data?.Page?.airingSchedules || [];
    const upcomingItems = upcomingToday.data?.Page?.airingSchedules || [];
    const weekItems = weekUpcoming.data?.Page?.airingSchedules || [];
    
    const allItems = [...finishedItems, ...upcomingItems, ...weekItems] as AiringSchedule[];
    
    // Deduplicate and filter
    const mediaMap = new Map<number, AiringSchedule>();
    allItems.forEach(item => {
      if (!item || !item.media || item.media.isAdult) return;
      const existing = mediaMap.get(item.mediaId);
      if (!existing || item.airingAt < existing.airingAt) {
        mediaMap.set(item.mediaId, item);
      }
    });

    return Array.from(mediaMap.values());
  }, [finishedToday.data, upcomingToday.data, weekUpcoming.data]);

  const isLoading = finishedToday.isLoading || upcomingToday.isLoading || weekUpcoming.isLoading;
  const isError = finishedToday.isError || upcomingToday.isError || weekUpcoming.isError;

  return (
    <div className="reveal">
      {isError ? (
        <div className="border border-border bg-secondary/5 p-10 text-center md:p-14">
          <p className="font-sans text-sm font-medium text-foreground">Couldn&apos;t load the schedule</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Check your connection and try again
          </p>
        </div>
      ) : isLoading ? (
        <ScheduleLoading />
      ) : (
        <ScheduleView data={schedules} />
      )}
    </div>
  );
}

export function Schedule() {
  return (
    <Suspense fallback={<ScheduleLoading />}>
      <ScheduleContent />
    </Suspense>
  );
}
