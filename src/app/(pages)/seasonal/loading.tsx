export default function Loading() {
  return (
    <div className="w-full">
      <section className="py-8 flex flex-col justify-center items-center">
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted mb-4"></div>
        <div className="h-6 w-96 animate-pulse rounded-md bg-muted mb-6"></div>
      </section>

      {/* Season Navigation skeleton */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
          <div className="text-center px-1">
            <div className="h-7 w-40 animate-pulse rounded-md bg-muted"></div>
          </div>
          <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
        </div>

        {/* Year Tabs skeleton */}
        <div className="flex flex-wrap items-center justify-center mb-2">
          <div className="h-8 w-full max-w-md animate-pulse rounded-md bg-muted"></div>
        </div>

        {/* Season Tabs skeleton */}
        <div className="h-12 w-full animate-pulse rounded-md bg-muted"></div>
      </div>

      {/* Anime Grid skeleton */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] w-full bg-muted rounded-md"></div>
            <div className="p-2">
              <div className="h-3 w-3/4 bg-muted rounded mt-1"></div>
              <div className="h-2 w-1/2 bg-muted rounded mt-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
