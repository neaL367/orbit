import { SearchResults } from "@/components/search-results";
import { Search } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="">
      <div className="mb-8 flex items-center gap-3">
        <Search className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          {q ? `Search results for "${q}"` : "Search"}
        </h1>
      </div>

      {q ? (
        <SearchResults query={q} />
      ) : (
        <div className="flex h-[50vh] items-center justify-center bg-muted/30 rounded-xl">
          <div className="text-center max-w-md px-4">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">Enter a search term</p>
            <p className="text-sm text-muted-foreground">
              Search for anime or manga titles to discover your next favorite
              series
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
