import { fetchAllTimePopularAnime } from "@/lib/api";
import { InfiniteScrollList } from "@/components/infinite-scroll-list";

export const metadata = {
  title: "All-Time Popular Anime | Orbit",
  description: "Discover the most popular anime of all time on Orbit",
};

export default async function PopularPage() {
  const { media: initialData } = await fetchAllTimePopularAnime();

  return (
    <div className="">
      <section className="py-8">
        <h1 className="text-4xl font-bold mb-4">All Time Popular</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Discover the most popular anime of all time
        </p>
      </section>

      <InfiniteScrollList
        initialData={initialData}
        fetchNextPage={async (page) => {
          "use server";
          const { media } = await fetchAllTimePopularAnime(page);
          return media;
        }}
        emptyMessage="No popular anime found"
      />
    </div>
  );
}
