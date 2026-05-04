export function ScheduleLoading() {
  return (
    <div className="space-y-4 md:space-y-5">
      <section className="motion-reduce:animate-none animate-in fade-in duration-700 slide-in-from-bottom-4 motion-reduce:slide-in-from-bottom-0">
        <div className="border border-white/8 bg-white/2 p-3 index-cut-tr md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="h-2.5 w-28 bg-secondary/35 shimmer" />
              <div className="h-6 w-48 max-w-full bg-secondary/45 shimmer" />
              <div className="h-2.5 w-56 max-w-full bg-secondary/30 shimmer" />
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 md:w-auto md:max-w-208 md:gap-0 md:divide-x md:divide-white/8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border border-white/8 bg-background/30 p-2 md:border-0 md:bg-transparent md:px-3">
                  <div className="h-2 w-10 bg-secondary/25 shimmer" />
                  <div className="mt-2 h-4 w-8 bg-secondary/40 shimmer" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 border border-white/8 bg-white/2 py-2">
          <div className="-mx-1 flex gap-2 overflow-hidden px-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="min-w-[108px] shrink-0 border border-white/8 bg-white/2 px-2.5 py-2">
                <div className="h-2 w-8 bg-secondary/30 shimmer" />
                <div className="mt-2 h-3 w-12 bg-secondary/40 shimmer" />
                <div className="mt-2 flex justify-between border-t border-white/8 pt-1">
                  <div className="h-2 w-4 bg-secondary/25 shimmer" />
                  <div className="h-2 w-8 bg-secondary/25 shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 border border-white/8 bg-white/2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 px-3 py-2">
            <div className="flex gap-2">
              <div className="h-2 w-12 bg-secondary/30 shimmer" />
              <div className="h-2 w-16 bg-secondary/30 shimmer" />
            </div>
            <div className="h-2 w-20 bg-secondary/25 shimmer" />
          </div>

          <div className="grid grid-cols-1 border-b border-white/8 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-white/8 px-3 py-3 last:border-b-0 md:border-b-0 md:border-r md:border-white/8 last:md:border-r-0">
                <div className="flex justify-between">
                  <div className="h-2 w-14 bg-secondary/30 shimmer" />
                  <div className="h-3 w-6 bg-secondary/35 shimmer" />
                </div>
                <div className="mt-3 space-y-2">
                  {[...Array(2)].map((__, j) => (
                    <div key={j} className="flex justify-between gap-2">
                      <div className="h-3 flex-1 bg-secondary/30 shimmer" />
                      <div className="h-3 w-12 bg-secondary/25 shimmer" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="divide-y divide-white/8">
            {[...Array(2)].map((_, h) => (
              <div key={h} className="px-3 py-3 md:px-4 md:py-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-3 w-14 bg-secondary/40 shimmer" />
                  <div className="h-px flex-1 bg-white/8" />
                  <div className="h-2 w-6 bg-secondary/25 shimmer" />
                </div>
                <div className="grid gap-2 md:grid-cols-[5.5rem_minmax(0,1fr)]">
                  <div className="hidden md:block">
                    <div className="h-4 w-16 bg-secondary/35 shimmer" />
                  </div>
                  <div className="space-y-1.5">
                    {[...Array(3)].map((__, r) => (
                      <div
                        key={r}
                        className="flex items-center justify-between gap-3 border border-white/6 bg-white/2 px-2.5 py-2.5"
                      >
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex gap-2">
                            <div className="h-2 w-8 bg-secondary/25 shimmer" />
                            <div className="h-2 w-10 bg-secondary/25 shimmer" />
                          </div>
                          <div className="h-3 w-full max-w-md bg-secondary/35 shimmer" />
                        </div>
                        <div className="h-6 w-20 border border-white/8 bg-white/3 shimmer" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
