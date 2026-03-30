"use client";

import { useQueries } from "@tanstack/react-query";
import { Suspense, useMemo } from "react";
import { ScheduleView } from "./view";
import { ScheduleLoading } from "./loading";
import { ScheduleAnimeQuery } from "@/lib/graphql/queries/schedule-anime";
import { execute } from "@/lib/graphql/execute";
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

  const dayQueries = useQueries({
    queries: dayRanges.map(({ dayIndex, start, end }, index) => {
      const isToday = index === 0;
      return {
        queryKey: ["ScheduleAnime", dayIndex, start, end, isToday],
        queryFn: async ({ signal }) => {
          if (isToday) {
            const [finishedResult, upcomingResult] = await Promise.all([
              execute(
                ScheduleAnimeQuery,
                {
                  page: 1,
                  perPage: 50,
                  notYetAired: false,
                  airingAt_greater: start,
                  airingAt_lesser: end,
                },
                { signal },
              ),
              execute(
                ScheduleAnimeQuery,
                {
                  page: 1,
                  perPage: 50,
                  notYetAired: true,
                  airingAt_greater: start,
                  airingAt_lesser: end,
                },
                { signal },
              ),
            ]);

            const finishedSchedules =
              finishedResult.data?.Page?.airingSchedules || [];
            const upcomingSchedules =
              upcomingResult.data?.Page?.airingSchedules || [];

            return {
              ...finishedResult.data,
              Page: {
                ...finishedResult.data?.Page,
                airingSchedules: [...finishedSchedules, ...upcomingSchedules],
              },
            };
          }

          const result = await execute(
            ScheduleAnimeQuery,
            {
              page: 1,
              perPage: 50,
              notYetAired: true,
              airingAt_greater: start,
              airingAt_lesser: end,
            },
            { signal },
          );
          return result.data;
        },
        staleTime: CACHE_TIMES.MEDIUM,
        retry: 2,
      };
    }),
  });

  const schedules = useMemo(() => {
    const allSchedules: AiringSchedule[] = [];

    dayQueries.forEach((query) => {
      if (query.data?.Page?.airingSchedules) {
        const validSchedules = query.data.Page.airingSchedules.filter(
          (schedule): schedule is AiringSchedule =>
            schedule !== null &&
            schedule.media !== null &&
            !schedule.media?.isAdult
        );
        allSchedules.push(...validSchedules);
      }
    });

    const seenIds = new Set<number>();
    const schedulesById = new Map<number, AiringSchedule>();

    for (const schedule of allSchedules) {
      if (seenIds.has(schedule.id)) continue;
      seenIds.add(schedule.id);
      schedulesById.set(schedule.id, schedule);
    }

    const schedulesByMedia = new Map<number, AiringSchedule>();

    for (const schedule of schedulesById.values()) {
      const existing = schedulesByMedia.get(schedule.mediaId);
      if (!existing || schedule.airingAt < existing.airingAt) {
        schedulesByMedia.set(schedule.mediaId, schedule);
      }
    }

    return Array.from(schedulesByMedia.values());
  }, [dayQueries]);

  const isLoading = dayQueries.some((query) => query.isLoading);
  const error = dayQueries.find((query) => query.error)?.error;

  return (
    <div className="reveal">
      {/* <div className="mb-8">
        <IndexSectionHeader
          title="Transmission_Registry"
          subtitle="Temporal_Log"
          as="h1"
          className="mb-4"
        />
      </div> */}

      {error ? (
        <div className="border border-border p-12 text-center">
          <span className="font-mono text-[10px] uppercase text-red-500">Registry_Sync_Failure</span>
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
    <Suspense
      fallback={
        <div>
          {/* <div className="mb-20">
            <IndexSectionHeader title="Transmission_Registry" subtitle="Temporal_Log" as="h1" />
          </div> */}
          <ScheduleLoading />
        </div>
      }
    >
      <ScheduleContent />
    </Suspense>
  );
}
