import { getTopRatedAnime } from "@/app/services/top-rated-anime";
import { InfiniteScrollList } from "@/components/infinite-scroll-list";
import { Star } from "lucide-react";

export const metadata = {
  title: "Top Rated Anime | Orbit",
  description: "Discover the highest rated anime on Orbit",
};

export default async function TopRatedPage() {
  const { media: initialData } = await getTopRatedAnime();

  return (
    <div className="">
      <section className="py-8">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <h1 className="text-2xl font-bold text-white">
            Top 100 Anime
          </h1>
        </div>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
          Explore the highest rated anime of all time, ranked by average user
          scores
        </p>
      </section>

      <InfiniteScrollList
        initialData={initialData}
        fetchNextPage={async (page) => {
          "use server";
          const { media } = await getTopRatedAnime(page);
          return media;
        }}
        emptyMessage="No top rated anime found"
        showRanking={true}
      />
    </div>
  );
}
