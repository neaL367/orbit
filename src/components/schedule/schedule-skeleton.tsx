import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ScheduleSkeleton() {
  // Generate the days of the week
  const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  const shortDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="space-y-8">
      {/* Premiere Banner Skeleton */}
      <Card className="w-full overflow-hidden border-0 shadow-lg">
        <div className="h-64 md:h-80 bg-muted animate-pulse">
          <div className="p-6 md:p-12">
            <Skeleton className="h-6 w-36 mb-4" />
            <Skeleton className="h-10 w-3/4 mb-2" />
            <div className="flex gap-3 mb-6">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-20" />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Schedule Tabs Skeleton */}
      <Tabs defaultValue="monday" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          {weekDays.map((day, index) => (
            <TabsTrigger key={day} value={day}>
              <span className="hidden md:inline">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
              <span className="md:hidden">{shortDays[index]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="monday" className="mt-6">
          <Skeleton className="h-8 w-40 mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="flex">
                    <Skeleton className="w-24 h-32" />
                    <div className="p-3 flex-1">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-24 mb-4" />
                      <div className="flex gap-3 mt-auto">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

