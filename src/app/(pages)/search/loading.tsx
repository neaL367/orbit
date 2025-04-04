export default function Loading() {
  return (
    <div className="">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted"></div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-[2/3] w-full animate-pulse rounded-md bg-muted"></div>
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
