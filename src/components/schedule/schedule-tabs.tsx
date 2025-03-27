"use client";

import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScheduleItem } from "@/anilist/utils/types";
import ScheduleCard from "./schedule-card";

interface ScheduleTabsProps {
  weeklySchedule: Record<string, ScheduleItem[]>;
  isLoading: boolean;
}

export default function ScheduleTabs({ 
  weeklySchedule, 
  isLoading 
}: ScheduleTabsProps) {
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

  const [activeDay, setActiveDay] = useState(
    format(new Date(), "EEEE").toLowerCase()
  );

  // If we have no data for any day, show a message
  const hasNoData = Object.values(weeklySchedule).every(
    (day) => day.length === 0
  );

  return (
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
            className={`hover:cursor-pointer hover:bg-gradient-to-r hover:from-primary border-0 hover:to-purple-400 hover:text-white transition-all relative ${
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
                {weeklySchedule[day.value]?.map((anime) => (
                  <ScheduleCard key={anime.id} anime={anime} />
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
  );
}
