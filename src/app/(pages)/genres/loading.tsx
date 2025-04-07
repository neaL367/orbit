export default function GenrePageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-8">
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted mb-4"></div>
        <div className="h-6 w-96 animate-pulse rounded-md bg-muted mb-6"></div>
      </section>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-md bg-muted"></div>
        ))}
      </div>
    </div>
  );
}
