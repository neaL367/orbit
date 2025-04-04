export default function Loading() {
  return (
    <div className="">
      <section className="py-8">
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted mb-4"></div>
        <div className="h-6 w-96 animate-pulse rounded-md bg-muted mb-6"></div>
      </section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 20 }).map((_, i) => (
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
