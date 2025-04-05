"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import Link from "next/link";
import { Clock, Calendar, Tv, ExternalLink, Play } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchWeeklySchedule } from "@/lib/api";
import type { AiringSchedule } from "@/lib/types";
import Image from "next/image";

const STREAMING_PLATFORMS = {
  Crunchyroll: {
    url: "https://www.crunchyroll.com/search?q=",
    color: "bg-[#F47521]",
  },
  Funimation: {
    url: "https://www.funimation.com/search/?q=",
    color: "bg-[#5B0BB5]",
  },
  Netflix: {
    url: "https://www.netflix.com/search?q=",
    color: "bg-[#E50914]",
  },
  Hulu: {
    url: "https://www.hulu.com/search?q=",
    color: "bg-[#1CE783]",
  },
  "Amazon Prime": {
    url: "https://www.amazon.com/s?k=",
    color: "bg-[#00A8E1]",
  },
  "HBO Max": {
    url: "https://www.hbomax.com/search?q=",
    color: "bg-[#5822B4]",
  },
  Disney: {
    url: "https://www.disneyplus.com/search?q=",
    color: "bg-[#113CCF]",
  },
  "Apple TV": {
    url: "https://tv.apple.com/search?term=",
    color: "bg-black",
  },
};

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

export interface PremiereAnime {
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

  // Generate week days starting from current week
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // 0 = Sunday

  const weekDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dayName = format(date, "EEEE");
    const shortName = format(date, "EEE");
    const value = format(date, "EEEE").toLowerCase();
    const isToday = format(today, "EEEE").toLowerCase() === value;

    return {
      name: dayName,
      shortName,
      value,
      date,
      isToday,
    };
  });

  const activeDay = format(today, "EEEE").toLowerCase();

  // Fetch schedule data
  useEffect(() => {
    const fetchScheduleData = async () => {
      setIsLoading(true);
      try {
        // Fetch weekly schedule
        const scheduleData = await fetchWeeklySchedule();

        // Convert to format needed for the UI
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
            })
          );
        });

        setWeeklySchedule(formattedSchedule);

        // Find upcoming premieres (first episodes)
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
          .slice(0, 5); // Take top 5 premieres

        setPremieres(upcomingPremieres);
      } catch (error) {
        console.error("Error fetching schedule data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

  // Update countdown timer
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

  if (isLoading) {
    return <LoadingSkeleton weekDays={weekDays} activeDay={activeDay} />;
  }

  return (
    <div className="min-h-screen">
      <section className="py-8">
        <h1 className="text-4xl font-bold mb-4">Anime Schedule</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Discover anime schedule
        </p>
      </section>

      {/* Upcoming Premiere Card */}
      {premieres.length > 0 && (
        <div className="mb-8">
          <Card className="w-full overflow-hidden border-0 shadow-lg">
            <div
              className="relative h-64 md:h-80 bg-cover bg-center rounded-xl"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${
                  currentPremiere.bannerImage ||
                  currentPremiere.coverImage.large
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-center py-4 px-6 md:px-12">
                <div className="max-w-3xl">
                  <div className="inline-block bg-primary bg-gradient-to-r to-purple-400 text-primary-foreground px-3 py-1 rounded-md text-xs font-medium mb-4">
                    UPCOMING PREMIERE
                  </div>

                  <h2 className="text-white text-sm md:text-2xl font-bold mb-2 line-clamp-1">
                    {currentPremiere.title.english ||
                      currentPremiere.title.romaji}
                  </h2>

                  <div className="flex flex-wrap gap-3 mb-6 text-white/80">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm md:text-base">
                        {currentPremiere.episodes || "??"} Episodes
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm md:text-base">
                        {currentPremiere.duration || "??"} min per episode
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 md:gap-3">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 md:p-3 text-center min-w-[70px]">
                      <div className="text-sm md:text-2xl font-bold text-white">
                        {timeRemaining.days}
                      </div>
                      <div className="text-[8px] md:text-xs text-white/70">
                        DAYS
                      </div>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 md:p-3 text-center min-w-[70px]">
                      <div className="text-sm md:text-2xl font-bold text-white">
                        {timeRemaining.hours}
                      </div>
                      <div className="text-[8px] md:text-xs text-white/70">
                        HOURS
                      </div>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 md:p-3 text-center min-w-[70px]">
                      <div className="text-sm md:text-2xl font-bold text-white">
                        {timeRemaining.minutes}
                      </div>
                      <div className="text-[8px] md:text-xs text-white/70">
                        MINUTES
                      </div>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 md:p-3 text-center min-w-[70px]">
                      <div className="text-sm md:text-2xl font-bold text-white">
                        {timeRemaining.seconds}
                      </div>
                      <div className="text-[8px] md:text-xs text-white/70">
                        SECONDS
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {premieres.length > 1 && (
                <div className="absolute bottom-4 right-4 flex space-x-1">
                  {premieres.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentPremiereIndex
                          ? "bg-primary"
                          : "bg-white/50"
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

      {/* Weekly Schedule Tabs */}
      <Tabs defaultValue={activeDay} className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          {weekDays.map((day) => (
            <TabsTrigger
              key={day.value}
              value={day.value}
              className={`hover:cursor-pointer hover:bg-gradient-to-r hover:from-primary hover:to-purple-400 hover:text-white border hover:border-0 transition-all relative ${
                day.isToday ? "font-bold" : ""
              }`}
            >
              <span className="hidden md:inline">{day.name}</span>
              <span className="md:hidden">{day.shortName}</span>
              {day.isToday && (
                <span className="md:ml-1 text-xs max-lg:absolute max-lg:-top-7 bg-gradient-to-r from-primary to-purple-400 text-primary-foreground rounded-full px-1.5">
                  Today
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {hasNoData ? (
          <div className="mt-8 text-center py-12 text-muted-foreground">
            <p>No anime schedule data available for this week.</p>
            <p className="mt-2">
              This could be due to a seasonal break or API limitations.
            </p>
          </div>
        ) : (
          weekDays.map((day) => (
            <TabsContent key={day.value} value={day.value} className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {day.name}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({format(day.date, "MMM d")})
                  </span>
                </h2>
              </div>

              {weeklySchedule[day.value]?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weeklySchedule[day.value]?.map((anime, index) => (
                    <ScheduleCard
                      key={`${day.value}-${anime.id}-${index}`}
                      anime={anime}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No anime scheduled for this day
                </div>
              )}
            </TabsContent>
          ))
        )}
      </Tabs>
    </div>
  );
}

interface ScheduleCardProps {
  anime: ScheduleAnime;
}

function ScheduleCard({ anime }: ScheduleCardProps) {
  const title =
    anime.title.userPreferred ||
    anime.title.english ||
    anime.title.romaji ||
    "";
  const airingTime = new Date(anime.airingAt * 1000);
  const formattedTime = format(airingTime, "h:mm a");

  // Default streaming platforms to show
  const platforms = ["Crunchyroll", "Netflix", "Hulu"];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-0">
        <div className="flex items-center ">
          <div className="w-24 h-32 shrink-0 relative overflow-hidden">
            <Image
              src={anime.coverImage.medium || ""}
              alt={anime.title.english || anime.title.romaji || ""}
              className="w-full h-full object-contain group-hover:scale-105 transition-all duration-300 brightness-85 rounded-lg"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority
            />
            <Link
              prefetch={true}
              href={`/anime/${anime.id}`}
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Play className="w-8 h-8 text-white" />
            </Link>
          </div>
          <div className="flex flex-col w-full px-3.5 gap-1.5">
            <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <span className="mr-2">Episode {anime.episode}</span>
              <span className="mr-2">•</span>
              <span>{formattedTime}</span>
            </div>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <span>{anime.format}</span>
              {anime.duration && (
                <>
                  <span className="mx-2">•</span>
                  <span>{anime.duration} min</span>
                </>
              )}
            </div>

            {/* Streaming platforms */}
            <div className="flex items-center gap-1.5 mt-1">
              <Tv className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex gap-1">
                <TooltipProvider>
                  {platforms.map((platform) => (
                    <Tooltip key={platform}>
                      <TooltipTrigger asChild>
                        <Link
                          prefetch={true}
                          href={`${
                            STREAMING_PLATFORMS[
                              platform as keyof typeof STREAMING_PLATFORMS
                            ].url
                          }${encodeURIComponent(
                            anime.title.english || anime.title.romaji || ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center w-5 h-5 rounded-full ${
                            STREAMING_PLATFORMS[
                              platform as keyof typeof STREAMING_PLATFORMS
                            ].color
                          } hover:opacity-80 transition-opacity`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-white text-[8px] font-bold">
                            {platform.charAt(0)}
                          </span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Watch on {platform}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        prefetch={true}
                        href={`https://www.google.com/search?q=watch+${encodeURIComponent(
                          anime.title.english || anime.title.romaji || ""
                        )}+online`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-primary to-purple-400 hover:opacity-80 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3 text-white" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Find more streaming options</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="min-h-screen">
      <section className="py-8">
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted mb-4"></div>
        <div className="h-6 w-96 animate-pulse rounded-md bg-muted mb-6"></div>
      </section>

      {/* Upcoming Premiere Card Skeleton */}
      <div className="mb-8">
        <Card className="w-full overflow-hidden border-0 shadow-lg">
          <div className="relative h-64 md:h-80 bg-muted rounded-xl">
            <div className="absolute inset-0 flex flex-col justify-center py-4 px-6 md:px-12">
              <div className="max-w-3xl">
                <Skeleton className="h-6 w-36 mb-4" />
                <Skeleton className="h-8 w-3/4 mb-2" />

                <div className="flex flex-wrap gap-3 mb-6">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                </div>

                <div className="flex flex-wrap gap-1.5 md:gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-black/20 backdrop-blur-sm rounded-lg p-1 md:p-3 text-center min-w-[70px]"
                    >
                      <Skeleton className="h-8 w-full mb-1" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 flex space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-2 h-2 rounded-full" />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Schedule Tabs Skeleton */}
      <div className="w-full">
        <div className="grid grid-cols-7 w-full h-10 bg-muted rounded-lg mb-6">
          {weekDays.map((day) => (
            <div
              key={day.value}
              className={`flex items-center justify-center ${
                day.value === activeDay ? "bg-muted-foreground/20" : ""
              }`}
            >
              <span className="hidden md:inline">
                <Skeleton className="h-4 w-16" />
              </span>
              <span className="md:hidden">
                <Skeleton className="h-4 w-8" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
