/**
 * Loading skeleton for schedule content only
 * Does not include page wrapper or header section
 */
export function ScheduleLoading() {
  return (
    <div className="animate-pulse space-y-12">
      {/* Upcoming Carousel skeleton */}
      <div className="mb-12">
        {/* SectionHeader skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-7 bg-zinc-800 rounded w-40" />
            <div className="h-4 bg-zinc-800/70 rounded w-56" />
          </div>
        </div>
        {/* Carousel content skeleton */}
        <div className="h-[400px] bg-zinc-900 rounded-xl" />
      </div>

      {/* Day Sections skeleton */}
      {[...Array(7)].map((_, dayIndex) => (
        <section key={dayIndex} className="space-y-6 rounded-xl border-2 border-zinc-800/50 bg-zinc-900/40">
          <div className="p-6 space-y-6">
            {/* Day Header skeleton */}
            <div className="flex items-center gap-3 pb-4 border-b-2 border-zinc-800/50">
              <div className="flex items-center gap-3 flex-1">
                {dayIndex === 0 && (
                  <div className="h-2 w-2 rounded-full bg-zinc-700" />
                )}
                <div className="h-7 md:h-8 bg-zinc-800 rounded w-32 md:w-40" />
              </div>
              <div className="h-6 bg-zinc-800 rounded w-16" />
            </div>

            {/* Format Groups skeleton */}
            <div className="space-y-8">
              {[...Array(2)].map((_, formatIndex) => (
                <div key={formatIndex} className="space-y-4">
                  {/* Format Header skeleton */}
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/50">
                    <div className="h-5 bg-zinc-800 rounded w-20" />
                    <div className="h-4 bg-zinc-800 rounded w-8" />
                  </div>

                  {/* Schedule Cards grid skeleton */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, cardIndex) => (
                      <div key={cardIndex} className="bg-zinc-900/50 border border-zinc-800 rounded-lg">
                        <div className="p-2 sm:p-3">
                          <div className="flex gap-2 sm:gap-3">
                            {/* Cover Image skeleton */}
                            <div className="w-16 h-24 sm:w-20 sm:h-28 bg-zinc-800 rounded shrink-0" />

                            {/* Content skeleton */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              {/* Badges skeleton */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="h-4 bg-zinc-800 rounded w-12" />
                                <div className="h-4 bg-zinc-800 rounded w-16" />
                                <div className="h-4 bg-zinc-800 rounded w-10" />
                              </div>

                              {/* Title skeleton */}
                              <div className="space-y-1">
                                <div className="h-3.5 bg-zinc-800 rounded w-full" />
                                <div className="h-3.5 bg-zinc-800 rounded w-4/5" />
                              </div>

                              {/* Streaming links skeleton */}
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <div className="h-5 bg-zinc-800 rounded w-16" />
                                <div className="h-5 bg-zinc-800 rounded w-14" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

