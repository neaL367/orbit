"use client";

import { format } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScheduleCard } from "./schedule-card";
import type { WeekDay, ScheduleMetadata } from "@/app/(pages)/schedule/page";

interface WeeklyScheduleData {
  [key: string]: ScheduleMetadata[];
}

interface ScheduleTabsProps {
  weekDays: WeekDay[];
  activeDay: string;
  weeklySchedule: WeeklyScheduleData;
  weekOffset: number;
  setWeekOffset: (offset: number) => void;
}

export function ScheduleTabs({
  weekDays,
  activeDay,
  weeklySchedule,
  weekOffset,
  setWeekOffset,
}: ScheduleTabsProps) {
  const hasSchedules =
    Object.keys(weeklySchedule).length > 0 &&
    !Object.values(weeklySchedule).every((schedules) => schedules.length === 0);

  return (
    <div className="space-y-6">
      {/* Week Navigation with Current Week Label */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="rounded-full h-9 w-9"
          aria-label="Previous week"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {weekOffset === 0
              ? "Current Week"
              : weekOffset < 0
              ? `${Math.abs(weekOffset)} ${
                  Math.abs(weekOffset) === 1 ? "Week" : "Weeks"
                } Ago`
              : `${weekOffset} ${weekOffset === 1 ? "Week" : "Weeks"} From Now`}
          </span>
          {weekOffset !== 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset(0)}
              className="h-7 rounded-full text-xs px-2 py-0"
            >
              Reset
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="rounded-full h-9 w-9"
          aria-label="Next week"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of Week Tabs */}
      <Tabs defaultValue={activeDay} className="w-full">
        <div className="relative">
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
        </div>

        {!hasSchedules ? (
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
