"use client";

import { useEffect, useState } from "react";
import { ScheduleQueries } from "@/anilist/queries/schedule";
import { PremiereItem, ScheduleItem } from "@/anilist/utils/types";
import { format } from "date-fns";
import CountdownBanner from "@/components/schedule/schedule-banner";
import NSFWToggle from "../nsfw-toggle";
import ScheduleTabs from "./schedule-tabs";



export default function ScheduleContent() {
  const [weeklySchedule, setWeeklySchedule] = useState<
    Record<string, ScheduleItem[]>
  >({});
  const [upcomingPremieres, setUpcomingPremieres] = useState<PremiereItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showNSFW, setShowNSFW] = useState(false);

  useEffect(() => {
    async function fetchScheduleData() {
      setIsLoading(true);
      try {
        // Initialize empty schedule for all days
        const initialSchedule: Record<string, ScheduleItem[]> = {
          sunday: [], monday: [], tuesday: [], wednesday: [], 
          thursday: [], friday: [], saturday: []
        };

        // Fetch airing schedule for the current week
        const response = await ScheduleQueries.getAiringSchedule({
          perPage: 50,
        });

        const airingSchedules = response.data.Page.airingSchedules;

        // Process each airing schedule
        airingSchedules.forEach((schedule) => {
          // Skip adult content if filter is enabled
          if (!showNSFW && schedule.media.isAdult) {
            return;
          }

          // Convert timestamp to Date object
          const airingDate = new Date(schedule.airingAt * 1000);

          // Get day of week (0-6, where 0 is Sunday)
          const dayIndex = airingDate.getDay();

          // Map to weekday names
          const weekdayMap = {
            0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday", 
            4: "thursday", 5: "friday", 6: "saturday"
          };

          const weekday = weekdayMap[dayIndex as keyof typeof weekdayMap];

          // Add to the appropriate day's schedule
          initialSchedule[weekday].push({
            ...schedule.media,
            airingAt: schedule.airingAt,
            episode: schedule.episode,
            airingTime: format(airingDate, "h:mm a"),
          });
        });

        setWeeklySchedule(initialSchedule);

        // Fetch upcoming premieres (first episodes airing soon)
        const premieresResponse = await ScheduleQueries.getUpcomingPremieres({
          perPage: 10,
        });

        const premieres = premieresResponse.data.Page.airingSchedules
          .filter((schedule) => schedule.episode === 1)
          .filter(
            (schedule) => showNSFW || !schedule.media.isAdult
          )
          .map((schedule) => ({
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

  return (
    <div className="space-y-8">
      {/* Premiere Countdown Banner */}
      {upcomingPremieres.length > 0 && (
        <CountdownBanner premieres={upcomingPremieres} />
      )}

      {/* NSFW Toggle */}
      <NSFWToggle onChange={setShowNSFW} />

      {/* Weekly Schedule Tabs */}
      <ScheduleTabs 
        weeklySchedule={weeklySchedule} 
        isLoading={isLoading} 
      />
    </div>
  );
}
