"use client";

import { useEffect, useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, ExternalLink, Play, Tv } from "lucide-react";
import CountdownBanner from "./countdown-banner";
import Image from "next/image";
import type { AiringSchedule, AnimeMedia } from "@/lib/anilist/utils/types";
import NSFWToggle from "./nsfw-toggle";
import { ScheduleQueries } from "@/lib/anilist/queries/schedule";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "next-view-transitions";

interface ScheduleItem extends AnimeMedia {
  airingAt: number;
  episode: number;
  airingTime: string;
}

interface PremiereItem {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  coverImage: {
    large: string | null;
    medium: string | null;
  };
  bannerImage: string | null;
  premiereDate: Date;
  episodes: number | string | null;
  duration: number | string | null;
}

// Map of weekday indices to names
const WEEKDAY_MAP = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

// Streaming platforms mapping
const STREAMING_PLATFORMS = {
  Crunchyroll: {
    // icon: "/platforms/crunchyroll.svg", // You'll need to add these icons to your public folder
    color: "bg-[#F47521]",
    url: "https://www.crunchyroll.com/search?q=",
  },
  Funimation: {
    // icon: "/platforms/funimation.svg",
    color: "bg-[#5A0FB4]",
    url: "https://www.funimation.com/search/?q=",
  },
  Netflix: {
    // icon: "/platforms/netflix.svg",
    color: "bg-[#E50914]",
    url: "https://www.netflix.com/search?q=",
  },
  Hulu: {
    // icon: "/platforms/hulu.svg",
    color: "bg-[#1CE783]",
    url: "https://www.hulu.com/search?q=",
  },
  Amazon: {
    // icon: "/platforms/amazon.svg",
    color: "bg-[#00A8E1]",
    url: "https://www.amazon.com/s?k=",
  },
  HiDive: {
    // icon: "/platforms/hidive.svg",
    color: "bg-[#00BAFF]",
    url: "https://www.hidive.com/search?q=",
  },
};

// Function to determine streaming platforms based on anime title or ID
// In a real app, you would fetch this data from your API
const getStreamingPlatforms = (anime: ScheduleItem) => {
  // This is a mock function - in a real app, you would get this data from your API
  // For now, we'll assign random platforms based on the anime ID
  const platforms: string[] = [];

  // Use the anime ID to deterministically assign platforms (for demo purposes)
  const id = anime.id;

  if (id % 2 === 0) platforms.push("Crunchyroll");
  if (id % 3 === 0) platforms.push("Funimation");
  if (id % 5 === 0) platforms.push("Netflix");
  if (id % 7 === 0) platforms.push("Hulu");
  if (id % 11 === 0) platforms.push("Amazon");
  if (id % 13 === 0) platforms.push("HiDive");

  // Ensure at least one platform is assigned
  if (platforms.length === 0) {
    platforms.push("Crunchyroll");
  }

  return platforms;
};

export default function ScheduleContent() {
  const [weeklySchedule, setWeeklySchedule] = useState<
    Record<string, ScheduleItem[]>
  >({});
  const [upcomingPremieres, setUpcomingPremieres] = useState<PremiereItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showNSFW, setShowNSFW] = useState(false);
  const [activeDay, setActiveDay] = useState(
    format(new Date(), "EEEE").toLowerCase()
  );

  // Generate the days of the week starting from current week
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfCurrentWeek, i);
    return {
      date: day,
      name: format(day, "EEEE"),
      shortName: format(day, "EEE"),
      value: format(day, "EEEE").toLowerCase(),
      isToday: format(today, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"),
    };
  });

  useEffect(() => {
    async function fetchScheduleData() {
      setIsLoading(true);
      try {
        // Initialize empty schedule for all days
        const initialSchedule: Record<string, ScheduleItem[]> = {};
        Object.values(WEEKDAY_MAP).forEach((day) => {
          initialSchedule[day] = [];
        });

        // Fetch airing schedule for the current week
        const response = await ScheduleQueries.getAiringSchedule({
          perPage: 50,
        });

        const airingSchedules = response.data.Page.airingSchedules;
        // console.log(
        //   `Total airing schedules fetched: ${airingSchedules.length}`
        // );

        // Process each airing schedule
        airingSchedules.forEach((schedule: AiringSchedule) => {
          // Skip adult content if filter is enabled
          if (!showNSFW && schedule.media.isAdult) {
            return;
          }

          // Convert timestamp to Date object
          const airingDate = new Date(schedule.airingAt * 1000);

          // Get day of week (0-6, where 0 is Sunday)
          const dayIndex = airingDate.getDay();

          // Get the weekday name from our map
          const weekday = WEEKDAY_MAP[dayIndex as keyof typeof WEEKDAY_MAP];

          console.log(
            `Show "${
              schedule.media.title.english || schedule.media.title.romaji
            }" airs on ${format(airingDate, "EEEE")} (${weekday})`
          );

          // Add to the appropriate day's schedule
          if (initialSchedule[weekday]) {
            initialSchedule[weekday].push({
              ...schedule.media,
              airingAt: schedule.airingAt,
              episode: schedule.episode,
              airingTime: format(airingDate, "h:mm a"),
            });
          }
        });

        // Log distribution of shows
        // Object.entries(initialSchedule).forEach(([day, shows]) => {
        //   console.log(`${day}: ${shows.length} shows`);
        // });

        setWeeklySchedule(initialSchedule);

        // Fetch upcoming premieres (first episodes airing soon)
        const premieresResponse = await ScheduleQueries.getUpcomingPremieres({
          perPage: 10,
        });

        const premieres = premieresResponse.data.Page.airingSchedules
          .filter((schedule: AiringSchedule) => schedule.episode === 1)
          .filter(
            (schedule: AiringSchedule) => showNSFW || !schedule.media.isAdult
          )
          .map((schedule: AiringSchedule) => ({
            id: schedule.media.id,
            title: schedule.media.title,
            coverImage: schedule.media.coverImage,
            bannerImage: schedule.media.bannerImage,
            premiereDate: new Date(schedule.airingAt * 1000),
            episodes: schedule.media.episodes || "?",
            duration: schedule.media.duration || "?",
          }))
          .slice(0, 3); // Limit to 3 premieres

        setUpcomingPremieres(premieres);
      } catch (error) {
        console.error("Failed to fetch schedule data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchScheduleData();
  }, [showNSFW]); // Re-fetch when NSFW filter changes

  // If we have no data for any day, show a message
  const hasNoData = Object.values(weeklySchedule).every(
    (day) => day.length === 0
  );

  return (
    <div className="space-y-8">
      {/* Premiere Countdown Banner */}
      {upcomingPremieres.length > 0 && (
        <CountdownBanner premieres={upcomingPremieres} />
      )}

      {/* NSFW Toggle */}
      <NSFWToggle onChange={setShowNSFW} />

      {/* Weekly Schedule Tabs */}
      <Tabs
        defaultValue={activeDay}
        onValueChange={setActiveDay}
        className="w-full"
      >
        <TabsList className="grid grid-cols-7 w-full">
          {weekDays.map((day) => (
            <TabsTrigger
              key={day.value}
              value={day.value}
              className={`hover:cursor-pointer hover:bg-gradient-to-r hover:from-primary hover:to-purple-400 hover:text-white transition-all relative ${
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

        {hasNoData && !isLoading ? (
          <div className="mt-8 text-center py-12 text-muted-foreground">
            <p>No anime schedule data available for this week.</p>
            <p className="mt-2">
              This could be due to a seasonal break or API limitations.
            </p>
          </div>
        ) : (
          weekDays.map((day) => (
            <TabsContent key={day.value} value={day.value} className="mt-6">
              <h2 className="text-xl font-semibold mb-4 ">
                {day.name}{" "}
                <span className="text-muted-foreground font-normal">
                  ({format(day.date, "MMM d")})
                </span>
              </h2>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4 h-32"></CardContent>
                    </Card>
                  ))}
                </div>
              ) : weeklySchedule[day.value]?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weeklySchedule[day.value]?.map((anime: ScheduleItem) => {
                    const platforms = getStreamingPlatforms(anime);

                    return (
                      <Card
                        key={anime.id}
                        className="overflow-hidden group hover:shadow-lg transition-all"
                      >
                        <CardContent className="p-0">
                          <div className="flex group-hover:bg-gradient-to-r group-hover:from-primary/10 group-hover:to-purple-400/10 transition-all">
                            <div className="w-24 h-32 shrink-0 relative overflow-hidden">
                              <Image
                                src={anime.coverImage.medium || ""}
                                alt={anime.title.english || anime.title.romaji}
                                className="w-full h-full object-contain group-hover:scale-105 transition-all duration-300"
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                priority
                              />
                              <Link
                                href={`/anime/${anime.id}`}
                                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Play className="w-8 h-8 text-white" />
                              </Link>
                            </div>
                            <div className="p-3 flex flex-col justify-between flex-1">
                              <div>
                                <Link href={`/anime/${anime.id}`}>
                                  <h3 className="font-medium line-clamp-2 transition-colors">
                                    {anime.title.english || anime.title.romaji}
                                  </h3>
                                </Link>
                                {anime.isAdult && (
                                  <span className="inline-block bg-red-500 text-white text-xs px-1.5 py-0.5 rounded mt-1 mr-1">
                                    NSFW
                                  </span>
                                )}
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  <span>{anime.airingTime}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center text-sm">
                                  <div className="flex items-center mr-3">
                                    <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                    <span>{anime.duration} min</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                    <span className="group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-400 group-hover:text-white group-hover:px-2 group-hover:rounded-full transition-all">
                                      Ep {anime.episode}
                                    </span>
                                  </div>
                                </div>

                                {/* Streaming Platforms */}
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Tv className="h-3.5 w-3.5 text-muted-foreground" />
                                  <div className="flex gap-1">
                                    <TooltipProvider>
                                      {platforms.map((platform) => (
                                        <Tooltip key={platform}>
                                          <TooltipTrigger asChild>
                                            <a
                                              href={`${
                                                STREAMING_PLATFORMS[
                                                  platform as keyof typeof STREAMING_PLATFORMS
                                                ].url
                                              }${encodeURIComponent(
                                                anime.title.english ||
                                                  anime.title.romaji
                                              )}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={`flex items-center justify-center w-5 h-5 rounded-full ${
                                                STREAMING_PLATFORMS[
                                                  platform as keyof typeof STREAMING_PLATFORMS
                                                ].color
                                              } hover:opacity-80 transition-opacity`}
                                            >
                                              {/* If you have SVG icons, use them here */}
                                              <span className="text-white text-[8px] font-bold">
                                                {platform.charAt(0)}
                                              </span>
                                            </a>
                                          </TooltipTrigger>
                                          <TooltipContent side="bottom">
                                            <p>Watch on {platform}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      ))}
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <a
                                            href={`https://www.google.com/search?q=watch+${encodeURIComponent(
                                              anime.title.english ||
                                                anime.title.romaji
                                            )}+online`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-primary to-purple-400 hover:opacity-80 transition-opacity"
                                          >
                                            <ExternalLink className="w-3 h-3 text-white" />
                                          </a>
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
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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
