export function ScheduleLoading() {
  return (
    <div className="space-y-24">
      {[...Array(3)].map((_, dayIndex) => (
        <section key={dayIndex} className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4" style={{ animationDelay: `${dayIndex * 150}ms` }}>
          {/* Day Header skeleton */}
          <div className="flex items-end gap-4 pb-4 border-b border-border">
            <div className="h-8 w-48 bg-secondary/50 shimmer" />
          </div>

          <div className="space-y-4">
            {[...Array(5)].map((_, cardIndex) => (
              <div
                key={cardIndex}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 p-4 border border-border bg-background/50"
              >
                {/* Time Column Skeleton */}
                <div className="sm:w-32 flex flex-col justify-center items-start sm:items-center py-2 border-b sm:border-b-0 sm:border-r border-border/50 shrink-0 gap-2">
                  <div className="h-6 w-16 bg-secondary/50 shimmer" />
                  <div className="h-2 w-20 bg-secondary/30 shimmer" />
                </div>

                {/* Visual Identity Column Skeleton */}
                <div className="w-24 h-16 sm:w-20 sm:h-28 bg-secondary/20 border border-border shrink-0 shimmer relative overflow-hidden" />

                {/* Identity & Metadata Column Skeleton */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-3/4 sm:w-1/2 bg-secondary/50 shimmer" />
                    <div className="w-1.5 h-1.5 bg-border rounded-full" />
                    <div className="h-3 w-12 bg-secondary/30 shimmer" />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-3 w-24 bg-secondary/30 shimmer" />
                    <div className="h-3 w-16 bg-secondary/30 shimmer" />
                  </div>
                </div>

                {/* Transmission Status Column Skeleton */}
                <div className="sm:w-32 flex justify-end items-center sm:pl-6 shrink-0">
                  <div className="h-7 w-24 bg-secondary/20 border border-border shimmer index-cut-tr" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
