import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScheduleDay } from "@/components/schedule-day"
import { getSchedule, getDayOfWeek } from "@/lib/db"

export default function SchedulePage() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const today = getDayOfWeek()

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Weekly Schedule</h1>

      <Tabs defaultValue={today.toLowerCase()}>
        <TabsList className="grid grid-cols-7 w-full">
          {days.map((day) => (
            <TabsTrigger key={day} value={day.toLowerCase()}>
              {day.slice(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>

        {days.map((day) => (
          <TabsContent key={day} value={day.toLowerCase()}>
            <Suspense fallback={<div>Loading schedule...</div>}>
              <DaySchedule day={day} />
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

async function DaySchedule({ day }: { day: string }) {
  const schedule = await getSchedule(day)
  return <ScheduleDay day={day} animeList={schedule} />
}

