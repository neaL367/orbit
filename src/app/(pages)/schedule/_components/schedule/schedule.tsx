"use client";

import { useQueries } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { ScheduleView } from "./view";
import { ScheduleLoading } from "./loading";
import { ScheduleAnimeQuery } from "@/services/graphql/queries";
import { execute } from "@/services/graphql/execute";
import { CACHE_TIMES } from "@/lib/constants";
import type { AiringSchedule } from "@/lib/graphql/types/graphql";
import { NsfwToggle } from "./nsfw";

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
  const [nsfwEnabled, setNsfwEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("nsfw_enabled") === "true";
    }
    return false;
  });

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
            (nsfwEnabled || !schedule.media?.isAdult),
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
  }, [dayQueries, nsfwEnabled]);

  const isLoading = dayQueries.some((query) => query.isLoading);
  const error = dayQueries.find((query) => query.error)?.error;

  return (
    <div className="min-h-screen bg-black text-white">
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16"
        style={{ maxWidth: "1680px" }}
      >
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">
            Anime Schedule
          </h1>
          <NsfwToggle onChange={setNsfwEnabled} />
        </div>

        {error ? (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Error loading schedule</h1>
            <p className="text-zinc-400">Please try again later.</p>
          </div>
        ) : isLoading ? (
          <ScheduleLoading />
        ) : (
          <ScheduleView data={schedules} />
        )}
      </div>
    </div>
  );
}

export function Schedule() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white">
          <div
            className="mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16"
            style={{ maxWidth: "1680px" }}
          >
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-8">
                Anime Schedule
              </h1>
            </div>
            <ScheduleLoading />
          </div>
        </div>
      }
    >
      <ScheduleContent />
    </Suspense>
  );
}
