export function ScheduleLoading() {
  return (
    <div className="space-y-24">
      {[...Array(3)].map((_, dayIndex) => (
        <section key={dayIndex} className="space-y-12">
          {/* Day Header skeleton */}
          <div className="flex items-end gap-4 mb-12">
            <div className="h-8 w-48 bg-secondary shimmer" />
            <div className="flex-1 h-[1px] bg-border mb-5" />
          </div>

          <div className="space-y-16">
            {[...Array(2)].map((_, formatIndex) => (
              <div key={formatIndex} className="space-y-8">
                {/* Format Header skeleton */}
                <div className="flex items-center gap-4">
                  <div className="h-4 w-24 bg-secondary shimmer" />
                  <div className="flex-1 h-[0.5px] bg-border" />
                </div>

                {/* Grid skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, cardIndex) => (
                    <div key={cardIndex} className="border border-border p-4 bg-background space-y-4">
                      <div className="aspect-video w-full bg-secondary shimmer" />
                      <div className="space-y-3">
                        <div className="h-3 bg-secondary shimmer w-full" />
                        <div className="h-3 bg-secondary shimmer w-2/3" />
                        <div className="pt-3 border-t border-border flex justify-between">
                          <div className="h-2 w-12 bg-secondary shimmer" />
                          <div className="h-2 w-12 bg-secondary shimmer" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
