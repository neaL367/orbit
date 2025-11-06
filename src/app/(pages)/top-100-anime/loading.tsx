import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";

export default function TopRatedPageLoading() {
  return (
    <div className="">
      <section className="py-8">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-6 w-full max-w-2xl mb-8" />
      </section>

      <div className="space-y-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2 relative">
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
