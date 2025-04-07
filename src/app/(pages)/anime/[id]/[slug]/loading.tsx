export default function Loading() {
  return (
    <div className="space-y-12">
      {/* Navigation skeleton */}
      <div className="h-8 w-24 animate-pulse rounded-md bg-muted"></div>

      <div className="min-h-screen pb-12">
        {/* Banner skeleton */}
        <div className="relative w-full h-[150px] sm:h-[380px] overflow-hidden mb-12 bg-muted rounded-t-lg"></div>

        <div className="w-full">
          <div className="mt-6 md:mt-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
              {/* Left Column - Details */}
              <div className="space-y-6">
                {/* Cover Image skeleton */}
                <div className="shrink-0 z-10 w-full self-start">
                  <div className="overflow-hidden aspect-[2/3] rounded-lg shadow-xl border-4 border-background bg-muted"></div>
                </div>

                {/* Basic Details Card skeleton */}
                <div className="space-y-3 rounded-xl border p-4 bg-card">
                  <div className="h-5 w-32 animate-pulse rounded-md bg-muted"></div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 w-20 animate-pulse rounded-md bg-muted"></div>
                      <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                    </div>
                  ))}
                </div>

                {/* Genres Card skeleton */}
                <div className="rounded-xl border p-4 bg-card">
                  <div className="h-5 w-20 animate-pulse rounded-md bg-muted mb-3"></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-16 animate-pulse rounded-full bg-muted"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Main Content */}
              <div className="space-y-8">
                {/* Title & Meta skeleton */}
                <div className="bg-background/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none mb-5 p-4 md:p-0 rounded-lg md:rounded-none">
                  <div className="h-10 w-3/4 animate-pulse rounded-md bg-muted"></div>
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted mt-2"></div>

                  <div className="flex flex-wrap gap-4 mt-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className="h-5 w-5 animate-pulse rounded-full bg-muted"></div>
                        <div className="h-5 w-12 animate-pulse rounded-md bg-muted"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description skeleton */}
                <div className="bg-card rounded-xl p-6 border">
                  <div className="h-5 w-24 animate-pulse rounded-md bg-muted mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                    <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                    <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                    <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted"></div>
                  </div>
                </div>

                {/* Trailer skeleton */}
                <div className="bg-card rounded-xl p-6 border">
                  <div className="h-5 w-20 animate-pulse rounded-md bg-muted mb-4"></div>
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted"></div>
                </div>

                {/* Tabs skeleton */}
                <div className="bg-card rounded-xl p-6 border">
                  <div className="w-full mb-6 grid grid-cols-1 md:grid-cols-3 gap-2 h-auto">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-10 animate-pulse rounded-md bg-muted"
                      ></div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="overflow-hidden rounded-lg border"
                        >
                          <div className="relative aspect-square bg-muted"></div>
                          <div className="p-3 flex flex-col items-center">
                            <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted"></div>
                            <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted mt-1"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
