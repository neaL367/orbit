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
import { Card } from "@/components/ui/card";
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
        <div className="mb-8">
          <Card className="w-full overflow-hidden border shadow-lg">
            <div
              className="relative h-[400px] sm:h-[450px] md:h-96 bg-cover bg-center rounded-xl"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${
                  currentPremiere.media.bannerImage ||
                  currentPremiere.media.coverImage.large
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
                    {currentPremiere.media.title.english ||
                      currentPremiere.media.title.romaji}
                  </h2>

                  <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-8 text-white/80">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                      <span className="text-xs sm:text-sm md:text-base">
                        {currentPremiere.media.episodes || "??"} Episodes
                      </span>
                    </div>
                    {currentPremiere.media.duration && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                        <span className="text-xs sm:text-sm md:text-base">
                          {currentPremiere.media.duration} min per episode
                        </span>
                      </div>
                    )}
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
                    <Link href={`/anime/${currentPremiere.media.id}`}>
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
