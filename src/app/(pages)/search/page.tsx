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
        <SearchResults query={q} />
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
