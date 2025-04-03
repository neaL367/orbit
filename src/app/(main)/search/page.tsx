import { Suspense } from "react";
import { SearchResults } from "@/components/search-results";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="">
      <div className="mb-8 flex items-center gap-4">
        <h1 className="text-2xl font-bold">
          {q ? `Search results for "${q}"` : "Search"}
        </h1>
      </div>

      {q ? (
        <Suspense fallback={<SearchSkeleton />}>
          <SearchResults query={q} />
        </Suspense>
      ) : (
        <div className="flex h-[50vh] items-center justify-center">
          <p className="text-lg text-muted-foreground">
            Enter a search term to find anime or manga
          </p>
        </div>
      )}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="aspect-[2/3] w-full animate-pulse rounded-md bg-muted"></div>
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted"></div>
        </div>
      ))}
    </div>
  );
}
