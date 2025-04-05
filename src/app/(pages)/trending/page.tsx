import { fetchTrendingAnime } from "@/lib/api";
import { InfiniteScrollList } from "@/components/infinite-scroll-list";

export const metadata = {
  title: "Trending Anime | Orbit",
  description: "Discover trending anime on Orbit",
};

export const revalidate = 3600;
export const dynamicParams = true;

export default async function TrendingPage() {
  const { media: initialData } = await fetchTrendingAnime();

  return (
    <div className="">
      <section className="py-8">
        <h1 className="text-4xl font-bold mb-4">Trending Anime</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Discover trending anime
        </p>
      </section>

      <InfiniteScrollList
        initialData={initialData}
        fetchNextPage={async (page) => {
          "use server";
          const { media } = await fetchTrendingAnime(page);
          return media;
        }}
        emptyMessage="No trending anime found"
      />
    </div>
  );
}
