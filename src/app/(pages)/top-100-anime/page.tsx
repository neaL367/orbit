import { fetchTopRatedAnime } from "@/lib/api";
import { InfiniteScrollList } from "@/components/infinite-scroll-list";

export const metadata = {
  title: "Top Rated Anime | Orbit",
  description: "Discover the highest rated anime on Orbit",
};

export default async function TopRatedPage() {
  const { media: initialData } = await fetchTopRatedAnime();

  return (
    <div className="">
      <section className="py-8">
        <h1 className="text-4xl font-bold mb-4">Top 100 Anime</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Discover the highest rated anime
        </p>
      </section>

      <InfiniteScrollList
        initialData={initialData}
        fetchNextPage={async (page) => {
          "use server";
          const { media } = await fetchTopRatedAnime(page);
          return media;
        }}
        emptyMessage="No top rated anime found"
        showRanking={true}
      />
    </div>
  );
}
