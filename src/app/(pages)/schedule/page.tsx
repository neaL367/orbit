"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format, addDays, startOfWeek } from "date-fns";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Play,
  Star,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { AiringSchedule } from "@/lib/types";
import { getWeeklyAnime } from "@/app/services/weekly-anime";
import { ScheduleCard } from "@/components/schedule-card";

interface WeekDay {
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

interface PremiereAnime {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  coverImage: {
    large: string;
    medium?: string;
  };
  bannerImage?: string;
  episode: number;
  episodes?: number;
  duration?: number;
  airingAt: number;
}

interface ScheduleAnime {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  coverImage: {
    large: string;
    medium?: string;
  };
  episode: number;
  airingAt: number;
  format: string;
  duration?: number;
  externalLinks?: {
    id: number;
    url: string;
    site: string;
    type?: string;
    language?: string;
    color?: string;
    icon?: string;
  }[];
}

interface WeeklyScheduleData {
  [key: string]: ScheduleAnime[];
}

export default function SchedulePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleData>({});
  const [premieres, setPremieres] = useState<PremiereAnime[]>([]);
  const [currentPremiereIndex, setCurrentPremiereIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week
  const [error, setError] = useState(false);

  const today = new Date();
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), {
    weekStartsOn: 1,
  }); // 1 = Monday

  const formatWeekRange = (start: Date) => {
    const end = addDays(start, 6);
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  };

  const weekDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dayName = format(date, "EEEE");
    const shortName = format(date, "EEE");
    const value = dayName.toLowerCase();
    // Only mark as today if we're on the current week (weekOffset === 0)
    const isToday =
      weekOffset === 0 && format(today, "EEEE").toLowerCase() === value;

    return {
      name: dayName,
      shortName,
      value,
      date,
      isToday,
    };
  });

  const activeDay = format(today, "EEEE").toLowerCase();

  const fetchScheduleData = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const scheduleData = await getWeeklyAnime(weekOffset);
      const hasAnyData = Object.values(scheduleData).some(
        (day) => day.length > 0
      );

      if (!hasAnyData && weekOffset === 1) {
        setError(true);
      } else {
        const formattedSchedule: WeeklyScheduleData = {};
        Object.entries(scheduleData).forEach(([day, schedules]) => {
          formattedSchedule[day.toLowerCase()] = schedules.map(
            (schedule: AiringSchedule) => ({
              id: schedule.media.id,
              title: schedule.media.title,
              coverImage: schedule.media.coverImage,
              episode: schedule.episode,
              airingAt: schedule.airingAt,
              format: schedule.media.format,
              duration: schedule.media.duration || undefined,
              externalLinks: schedule.media.externalLinks || [],
            })
          );
        });

        setWeeklySchedule(formattedSchedule);

        const allSchedules = Object.values(scheduleData).flat();
        const upcomingPremieres = allSchedules
          .filter((schedule: AiringSchedule) => schedule.episode === 1)
          .map((schedule: AiringSchedule) => ({
            id: schedule.media.id,
            title: schedule.media.title,
            coverImage: schedule.media.coverImage,
            bannerImage: schedule.media.bannerImage,
            episode: schedule.episode,
            episodes: schedule.media.episodes || undefined,
            duration: schedule.media.duration || undefined,
            airingAt: schedule.airingAt,
          }))
          .sort((a, b) => a.airingAt - b.airingAt)
          .slice(0, 5);

        setPremieres(upcomingPremieres);
      }
    } catch (error) {
      console.error("Error fetching schedule data:", error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [weekOffset]);

  // Fetch schedule only when the component mounts or weekOffset changes.
  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  // Update countdown timer for premieres
  useEffect(() => {
    if (!premieres.length) return;
    const currentPremiere = premieres[currentPremiereIndex];
    const targetTime = currentPremiere.airingAt * 1000; // Convert to milliseconds

    const updateCountdown = () => {
      const now = Date.now();
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
  }, [premieres, currentPremiereIndex]);

  const currentPremiere = premieres[currentPremiereIndex] || {
    title: { english: "Loading...", romaji: "Loading..." },
    coverImage: { large: "" },
    bannerImage: "",
    episodes: undefined,
    duration: undefined,
  };

  const hasNoData = Object.values(weeklySchedule).every(
    (schedules) => !schedules || schedules.length === 0
  );

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

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">
              {formatWeekRange(weekStart)}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWeekOffset(0);
                setError(false);
              }}
              disabled={weekOffset === 0}
              className="rounded-full"
            >
              Current Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWeekOffset(1);
                setError(false);
              }}
              disabled={weekOffset === 1}
              className="rounded-full"
            >
              Next Week
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton weekDays={weekDays} activeDay={activeDay} />;
  }

  return (
    <div className="">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to home</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white">Anime Schedule</h1>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="mb-3.5 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-base md:text-lg font-medium">
            {formatWeekRange(weekStart)}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(0)}
            disabled={weekOffset === 0}
            className="rounded-full"
          >
            Current Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(1)}
            disabled={weekOffset === 1}
            className="rounded-full"
          >
            Next Week
          </Button>
        </div>
      </div>

      {premieres.length > 0 && (
        <div className="mb-8">
          <Card className="w-full overflow-hidden border shadow-lg">
            <div
              className="relative h-[400px] sm:h-[450px] md:h-96 bg-cover bg-center rounded-xl"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${
                  currentPremiere.bannerImage ||
                  currentPremiere.coverImage.large
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:py-4 sm:px-6 md:px-12">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-1.5 bg-white text-primary px-2 sm:px-3 py-1 rounded-full text-xs font-medium mb-2 sm:mb-4">
                    <Star className="h-3 w-3" />
                    <span className="text-[10px] sm:text-xs">
                      UPCOMING PREMIERE
                    </span>
                  </div>

                  <h2 className="text-white text-lg sm:text-xl md:text-3xl font-bold mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-1">
                    {currentPremiere.title.english ||
                      currentPremiere.title.romaji}
                  </h2>

                  <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-8 text-white/80">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                      <span className="text-xs sm:text-sm md:text-base">
                        {currentPremiere.episodes || "??"} Episodes
                      </span>
                    </div>
                    {currentPremiere.duration ? (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                        <span className="text-xs sm:text-sm md:text-base">
                          {currentPremiere.duration || ""} min per episode
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-4 max-w-md">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 sm:p-2 md:p-4 text-center">
                      <div className="text-sm sm:text-base md:text-3xl font-bold text-white">
                        {timeRemaining.days}
                      </div>
                      <div className="text-[8px] sm:text-[10px] md:text-xs text-white/70 uppercase tracking-wider">
                        Days
                      </div>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 sm:p-2 md:p-4 text-center">
                      <div className="text-sm sm:text-base md:text-3xl font-bold text-white">
                        {timeRemaining.hours}
                      </div>
                      <div className="text-[8px] sm:text-[10px] md:text-xs text-white/70 uppercase tracking-wider">
                        Hours
                      </div>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 sm:p-2 md:p-4 text-center">
                      <div className="text-sm sm:text-base md:text-3xl font-bold text-white">
                        {timeRemaining.minutes}
                      </div>
                      <div className="text-[8px] sm:text-[10px] md:text-xs text-white/70 uppercase tracking-wider">
                        Min
                      </div>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 sm:p-2 md:p-4 text-center">
                      <div className="text-sm sm:text-base md:text-3xl font-bold text-white">
                        {timeRemaining.seconds}
                      </div>
                      <div className="text-[8px] sm:text-[10px] md:text-xs text-white/70 uppercase tracking-wider">
                        Sec
                      </div>
                    </div>
                  </div>

                  <Button
                    className="mt-4 sm:mt-6 md:mt-8 bg-white/90 hover:bg-white text-primary rounded-full text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 h-auto"
                    asChild
                  >
                    <Link href={`/anime/${currentPremiere.id}`}>
                      <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>

              {premieres.length > 1 && (
                <div className="hidden absolute bottom-2 sm:bottom-4 right-2 sm:right-4 md:flex space-x-1 sm:space-x-2">
                  {premieres.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                        index === currentPremiereIndex
                          ? "bg-primary scale-110"
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                      onClick={() => setCurrentPremiereIndex(index)}
                      aria-label={`View premiere ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <Tabs defaultValue={activeDay} className="w-full">
        <TabsList className="grid gap-1 grid-cols-7 w-full h-full rounded-xl">
          {weekDays.map((day) => (
            <TabsTrigger
              key={day.value}
              value={day.value}
              className={`hover:cursor-pointer hover:bg-primary/30 hover:text-white border hover:border-0 transition-all relative py-3 ${
                day.isToday ? "font-bold" : ""
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="hidden md:inline">{day.name}</span>
                <span className="text-xs md:hidden">{day.shortName}</span>
                <span className="hidden md:flex text-xs text-muted-foreground md:mt-1">
                  {format(day.date, "MMM d")}
                </span>
                {day.isToday && (
                  <span className="absolute -top-6 md:-top-2 bg-white text-primary rounded-full px-1 md:px-2 py-0.5 text-[10px] font-medium">
                    Today
                  </span>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {hasNoData ? (
          <div className="mt-8 text-center py-16 text-muted-foreground bg-muted/30 rounded-xl">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">
              No anime schedule data available for this week.
            </p>
            <p className="mt-2">
              This could be due to a seasonal break or API limitations.
            </p>
          </div>
        ) : (
          weekDays.map((day) => (
            <TabsContent key={day.value} value={day.value} className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {day.name}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({format(day.date, "MMM d")})
                  </span>
                </h2>
                <Badge variant="outline" className="rounded-full px-3">
                  {weeklySchedule[day.value]?.length || 0} anime
                </Badge>
              </div>

              {weeklySchedule[day.value]?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {weeklySchedule[day.value]?.map((anime, index) => (
                    <ScheduleCard
                      key={`${day.value}-${anime.id}-${index}`}
                      anime={anime}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-xl">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">
                    No anime scheduled for this day
                  </p>
                </div>
              )}
            </TabsContent>
          ))
        )}
      </Tabs>
    </div>
  );
}

function LoadingSkeleton({
  weekDays,
  activeDay,
}: {
  weekDays: WeekDay[];
  activeDay: string;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="mb-8">
        <Card className="w-full overflow-hidden border-0 shadow-lg">
          <div className="relative h-64 md:h-96 bg-muted rounded-xl">
            <div className="absolute inset-0 flex flex-col justify-center py-4 px-6 md:px-12">
              <div className="max-w-3xl">
                <Skeleton className="h-6 w-36 mb-4" />
                <Skeleton className="h-10 w-3/4 mb-2" />
                <Skeleton className="h-8 w-1/2 mb-4" />

                <div className="flex flex-wrap gap-3 mb-6">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                </div>

                <div className="flex flex-wrap gap-2 md:gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-black/20 backdrop-blur-sm rounded-lg p-2 md:p-4 text-center min-w-[80px]"
                    >
                      <Skeleton className="h-10 w-full mb-1" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>

                <Skeleton className="h-10 w-32 mt-8 rounded-full" />
              </div>
            </div>

            <div className="absolute bottom-4 right-4 flex space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-3 h-3 rounded-full" />
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-7 w-full h-16 bg-muted rounded-xl mb-6">
          {weekDays.map((day) => (
            <div
              key={day.value}
              className={`flex flex-col items-center justify-center gap-1 ${
                day.value === activeDay ? "bg-muted-foreground/20" : ""
              }`}
            >
              <Skeleton className="h-4 w-16 hidden md:block" />
              <Skeleton className="h-4 w-8 md:hidden" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>

        <Skeleton className="h-8 w-48 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
