"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { format, addDays, startOfWeek } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Play,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { AiringSchedule, AnimeMedia } from "@/lib/types"; // adjust types as needed

import SchedulePageLoading from "./loading";
import { WEEKLY_SCHEDULE_QUERY } from "@/app/graphql/queries/weekly-schedule";
import { ScheduleCard } from "@/components/schedule-card";

// Define additional local types if needed
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

export default function SchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week
  const today = new Date();
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), {
    weekStartsOn: 1,
  });
  const weekEnd = addDays(weekStart, 6);

  // Calculate UNIX timestamps (in seconds) for the schedule query variables.
  // Assuming the airingAt field in the API is in seconds.
  const airingAtGreater = Math.floor(weekStart.getTime() / 1000);
  const airingAtLesser = Math.floor(addDays(weekEnd, 1).getTime() / 1000) - 1; // end of day

  // Set up the query using useQuery hook
  const { data, loading, error } = useQuery(WEEKLY_SCHEDULE_QUERY, {
    variables: {
      airingAtGreater,
      airingAtLesser,
      page: 1,
      perPage: 50,
    },
    // You might use notifyOnNetworkStatusChange if needed.
    notifyOnNetworkStatusChange: true,
  });

  // Local state for premieres and countdown timer
  const [premieres, setPremieres] = useState<ScheduleMetadata[]>([]);
  const [currentPremiereIndex, setCurrentPremiereIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Build weekDays for tab navigation
  const weekDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dayName = format(date, "EEEE");
    const shortName = format(date, "EEE");
    const value = dayName.toLowerCase();
    // Mark as today only if weekOffset is 0 and day matches
    const isToday =
      weekOffset === 0 && format(today, "EEEE").toLowerCase() === value;
    return { name: dayName, shortName, value, date, isToday };
  });
  const activeDay = format(today, "EEEE").toLowerCase();

  // Process the query data into a WeeklyScheduleData object where keys are day names
  const weeklySchedule: WeeklyScheduleData = {};
  if (data && data.Page && data.Page.airingSchedules) {
    data.Page.airingSchedules.forEach((schedule: AiringSchedule) => {
      // Convert airingAt (seconds) to a Date
      const scheduleDate = new Date(schedule.airingAt * 1000);
      const dayKey = format(scheduleDate, "EEEE").toLowerCase();
      if (!weeklySchedule[dayKey]) {
        weeklySchedule[dayKey] = [];
      }
      // Map to our ScheduleAnime shape (you can adjust mappings as needed)
      weeklySchedule[dayKey].push({
        id: schedule.id,
        airingAt: schedule.airingAt,
        episode: schedule.episode,
        media: schedule.media,
      });
    });
  }

  // Identify upcoming premieres (episodes === 1) among all schedules
  useEffect(() => {
    if (data && data.Page && data.Page.airingSchedules) {
      const allSchedules: ScheduleMetadata[] = data.Page.airingSchedules.map(
        (s: AiringSchedule) => ({
          id: s.id,
          airingAt: s.airingAt,
          episode: s.episode,
          media: s.media,
        })
      );
      // Filter for premieres that haven't aired yet (airingAt > current time)
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const upcomingPremieres = allSchedules
        .filter((s) => s.episode === 1 && s.airingAt > currentTimestamp)
        .sort((a, b) => a.airingAt - b.airingAt)
        .slice(0, 5);

      setPremieres(upcomingPremieres);

      // If we have premieres, make sure the countdown starts immediately
      if (upcomingPremieres.length > 0) {
        updateCountdown(upcomingPremieres[0].airingAt);
      }
    }
  }, [data]);

  // Function to calculate and set the time remaining
  const updateCountdown = (targetTimestamp: number) => {
    const now = Date.now();
    const targetTime = targetTimestamp * 1000; // Convert to milliseconds
    const difference = Math.max(0, targetTime - now);

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    setTimeRemaining({ days, hours, minutes, seconds });
  };

  // Countdown timer logic for premieres
  useEffect(() => {
    if (!premieres.length) return;

    const currentPremiere = premieres[currentPremiereIndex];
    if (!currentPremiere) return;

    // Initial update
    updateCountdown(currentPremiere.airingAt);

    // Set up the interval
    const interval = setInterval(() => {
      updateCountdown(currentPremiere.airingAt);
    }, 1000);

    // Clean up the interval
    return () => clearInterval(interval);
  }, [premieres, currentPremiereIndex]);

  // Update countdown when changing premiere
  useEffect(() => {
    if (premieres.length > 0 && premieres[currentPremiereIndex]) {
      updateCountdown(premieres[currentPremiereIndex].airingAt);
    }
  }, [currentPremiereIndex, premieres]);

  const currentPremiere = premieres[currentPremiereIndex] || {
    media: {
      title: { english: "Loading...", romaji: "Loading..." },
      coverImage: { large: "" },
      format: "",
    },
    episode: 0,
    airingAt: 0,
  };

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
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
      </div>
    );
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
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
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
        <div className="mb-6 md:mb-10 px-2 sm:px-4 md:px-6">
          <div className="relative overflow-hidden rounded-xl bg-black/5 backdrop-blur-sm">
            {/* Background image with blur effect */}
            <div
              className="absolute inset-0 opacity-20 blur-sm"
              style={{
                backgroundImage: `url(${
                  currentPremiere.media.bannerImage ||
                  currentPremiere.media.coverImage.large
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            <div className="relative z-10 p-4 sm:p-6 md:p-8">
              {/* Premiere badge */}
              <div className="inline-flex w-full justify-center items-center text-xs font-medium mb-4 md:mb-6">
                <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full flex gap-2">
                  <Star className="h-3 w-3 text-yellow-400" />
                  <span className="uppercase tracking-wide text-[10px]">
                    Upcoming Premiere
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4 md:gap-8 place-content-center place-items-center">
                {/* Left: Title and info */}
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 md:mb-3 line-clamp-2">
                    {currentPremiere.media.title.english ||
                      currentPremiere.media.title.romaji}
                  </h2>

                  <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 md:mb-6 items-center justify-center text-xs sm:text-sm opacity-80">
                    <div className="flex justify-center items-center">
                      <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                      <span>
                        {currentPremiere.episode || ""} Episodes
                      </span>
                    </div>
                    {currentPremiere.media.duration && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                        <span>
                          {currentPremiere.media.duration} min per ep.
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    className="group relative overflow-hidden rounded-full px-4 sm:px-5 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300"
                    asChild
                  >
                    <Link href={`/anime/${currentPremiere.media.id}`}>
                      <span className="relative z-10 flex items-center gap-1.5 sm:gap-2 text-sm">
                        <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>View Details</span>
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-zinc-500/40 to-zinc-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </Button>
                </div>

                {/* Right: Countdown */}
                <div className="relative mt-4 md:mt-0 w-full md:w-auto">
                  <div className="absolute -inset-1 bg-gradient-to-br from-zinc-300/20 to-zinc-300/20 rounded-xl blur-sm" />
                  <div className="relative w-full md:w-max bg-black/30 backdrop-blur-md rounded-lg p-3 sm:p-4">
                    <p className="text-xs uppercase tracking-wider mb-2 sm:mb-3 opacity-70 text-center">
                      Premieres in
                    </p>
                    <div className="flex gap-4 sm:gap-8 md:gap-12 lg:gap-20 justify-between">
                      {[
                        { value: timeRemaining.days, label: "d" },
                        { value: timeRemaining.hours, label: "h" },
                        { value: timeRemaining.minutes, label: "m" },
                        { value: timeRemaining.seconds, label: "s" },
                      ].map((time, index) => (
                        <div key={index} className="text-center">
                          <p className="text-lg sm:text-xl md:text-2xl font-mono font-bold">
                            {time.value.toString().padStart(2, "0")}
                          </p>
                          <p className="text-xs opacity-70">{time.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimal premiere navigation */}
              {premieres.length > 1 && (
                <div className="flex justify-center mt-4 sm:mt-6 space-x-1.5">
                  {premieres.map((_, index) => (
                    <button
                      key={index}
                      className={`w-4 sm:w-6 h-1 rounded-full transition-all duration-300 ${
                        index === currentPremiereIndex
                          ? "bg-white/80 w-6 sm:w-8"
                          : "bg-white/30 hover:bg-white/50"
                      }`}
                      onClick={() => setCurrentPremiereIndex(index)}
                      aria-label={`View premiere ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
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

        {Object.keys(weeklySchedule).length === 0 ||
        Object.values(weeklySchedule).every(
          (schedules) => schedules.length === 0
        ) ? (
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
