"use client";

import { format } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScheduleCard } from "./schedule-card";
import type { WeekDay, ScheduleMetadata } from "@/app/(pages)/schedule/page";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface WeeklyScheduleData {
  [day: string]: ScheduleMetadata[];
}

interface ScheduleTabsProps {
  weekDays: WeekDay[];
  activeDay: string;
  weeklySchedule: WeeklyScheduleData;
  onDaySelect?: (day: string) => void;
}

/**
 * Displays a set of tabs for each day of the week along with their schedules.
 */
export function ScheduleTabs({
  weekDays,
  activeDay,
  weeklySchedule,
  onDaySelect,
}: ScheduleTabsProps) {
  // Check if there is any scheduled anime for the week.
  const hasSchedules = useMemo(
    () =>
      Object.keys(weeklySchedule).length > 0 &&
      !Object.values(weeklySchedule).every(
        (schedules) => schedules.length === 0
      ),
    [weeklySchedule]
  );

  return (
    <div className="space-y-6">
      {/* Days of Week Tabs */}
      <Tabs defaultValue={activeDay} className="w-full">
        <div className="relative">
          <TabsList
            id="days-tabs-list"
            className="grid grid-cols-7 h-auto bg-transparent gap-1 overflow-x-auto scrollbar-hide"
          >
            {weekDays.map((day) => (
              <TabsTrigger
                key={day.value}
                value={day.value}
                onClick={() => onDaySelect?.(day.value)}
                className={cn(
                  "transition-all py-3 relative hover:cursor-pointer",
                  "data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground",
                  "data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary",
                  day.isToday && "font-bold"
                )}
              >
                <div className="flex flex-col items-center">
                  <span className="hidden md:inline">{day.name}</span>
                  <span className="text-xs md:hidden">{day.shortName}</span>
                  <span className="hidden md:flex text-xs text-muted-foreground mt-1">
                    {format(day.date, "MMM d")}
                  </span>
                  {day.isToday && (
                    <span className="absolute -top-6 md:-top-2 bg-primary text-primary-foreground rounded-full px-1 md:px-2 py-0.5 text-[10px] font-medium">
                      Today
                    </span>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          {/* Gradient overlay for mobile */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-background to-transparent w-12 h-full flex items-center justify-end pr-1 pointer-events-none md:hidden">
            <div className="animate-pulse bg-primary/20 rounded-full p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-primary"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tabs content */}
        {hasSchedules ? (
          weekDays.map((day) => (
            <TabsContent
              key={day.value}
              value={day.value}
              className="mt-6 animate-in fade-in-50 duration-300"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {day.name}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({format(day.date, "MMM d")})
                  </span>
                </h2>
                <Badge variant="outline" className="rounded-full px-3">
                  {(weeklySchedule[day.value] || []).length} anime
                </Badge>
              </div>

              {weeklySchedule[day.value] &&
              weeklySchedule[day.value].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {weeklySchedule[day.value].map((anime, index) => (
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
        ) : (
          <div className="mt-8 text-center py-16 text-muted-foreground bg-muted/30 rounded-xl">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">
              No anime schedule data available for this week.
            </p>
            <p className="mt-2">
              This could be due to a seasonal break or API limitations.
            </p>
          </div>
        )}
      </Tabs>
    </div>
  );
}
