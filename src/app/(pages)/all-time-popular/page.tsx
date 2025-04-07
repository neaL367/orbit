import { getAllTimePopularAnime } from "@/app/services/all-time-popular";
import { InfiniteScrollList } from "@/components/infinite-scroll-list";
import { Users } from "lucide-react";

export const metadata = {
  title: "All-Time Popular Anime | Orbit",
  description: "Discover the most popular anime of all time on Orbit",
};

export default async function PopularPage() {
  const { media: initialData } = await getAllTimePopularAnime();

  return (
    <div className="">
      <section className="py-8">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-white">
            All Time Popular
          </h1>
        </div>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
          Explore the most watched and followed anime series throughout history
        </p>
      </section>

      <InfiniteScrollList
        initialData={initialData}
        fetchNextPage={async (page) => {
          "use server";
          const { media } = await getAllTimePopularAnime(page);
          return media;
        }}
        emptyMessage="No popular anime found"
      />
    </div>
  );
}
