import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingAnimeCard() {
  return (
    <Card className="h-full overflow-hidden">
      <Skeleton className="aspect-[2/3] w-full" />
      <CardContent className="p-3">
        <Skeleton className="mb-2 h-4 w-3/4" />
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export function LoadingAnimeGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingAnimeCard key={i} />
      ))}
    </div>
  );
}

export function LoadingAnimeDetails() {
  return (
    <div className="space-y-8 mt-24 mb-24">
      <div className="relative h-[300px] w-full overflow-hidden rounded-lg sm:h-[400px]">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr]">
        <div>
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />

          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
