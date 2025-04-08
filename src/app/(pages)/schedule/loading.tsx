import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SchedulePageLoading() {
  return (
    <div className="">
      <div className="mb-8 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="mb-8">
        <Card className="w-full overflow-hidden border-0 shadow-lg">
          <div className="relative h-64 md:h-96 bg-muted rounded-xl">
            <div className="absolute inset-0 flex flex-col justify-center py-4 px-6 md:px-12">
              <div className="max-w-3xl">
                <Skeleton className="h-6 w-36 mb-4" />
                <Skeleton className="h-10 w-3/4 mb-2" />
                <Skeleton className="h-8 w-1/2 mb-4" />

                <div className="flex flex-wrap gap-3 mb-6">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                </div>

                <div className="flex flex-wrap gap-2 md:gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-black/20 backdrop-blur-sm rounded-lg p-2 md:p-4 text-center min-w-[80px]"
                    >
                      <Skeleton className="h-10 w-full mb-1" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>

                <Skeleton className="h-10 w-32 mt-8 rounded-full" />
              </div>
            </div>

            <div className="absolute bottom-4 right-4 flex space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-3 h-3 rounded-full" />
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="w-full">
        <Skeleton className="h-8 w-48 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
