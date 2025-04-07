import { getTrendingAnime } from "@/app/services/trending-anime";
import { InfiniteScrollList } from "@/components/infinite-scroll-list";
import { TrendingUp } from "lucide-react";

export const metadata = {
  title: "Trending Anime | Orbit",
  description: "Discover trending anime on Orbit",
};

export default async function TrendingPage() {
  const { media: initialData } = await getTrendingAnime();

  return (
    <div className="">
      <section className="py-8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-white">Trending Anime</h1>
        </div>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
          Discover the most popular anime right now, updated hourly based on
          user activity
        </p>
      </section>

      <InfiniteScrollList
        initialData={initialData}
        fetchNextPage={async (page) => {
          "use server";
          const { media } = await getTrendingAnime(page);
          return media;
        }}
        emptyMessage="No trending anime found"
      />
    </div>
  );
}
