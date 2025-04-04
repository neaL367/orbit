import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { AnimeCard } from "@/components/anime-card";
import { Button } from "@/components/ui/button";
import {
  fetchTrendingAnime,
  fetchAllTimePopularAnime,
  fetchTopRatedAnime,
  fetchAiringSchedule,
} from "@/lib/api";
import type { AiringSchedule } from "@/lib/types";

export default async function HomePage() {
  // Fetch data for each section
  const { media: trendingAnime } = await fetchTrendingAnime(1, 6);
  const { media: popularAnime } = await fetchAllTimePopularAnime(1, 6);
  const { media: topRatedAnime } = await fetchTopRatedAnime(1, 6);

  // Fetch upcoming premieres (first episodes)
  const { schedules } = await fetchAiringSchedule(1, 6, true);
  const upcomingPremieres = schedules
    .filter((schedule: AiringSchedule) => schedule.episode === 1)
    .slice(0, 6);

  return (
    <div className=" ">
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="py-12">
          <h1 className="text-4xl font-bold mb-4">Discover Anime</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Explore the latest trending, popular, and top-rated animFe all in
            one place
          </p>
        </section>

        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Trending Now</h2>
            <Link prefetch={true} href="/trending">
              <Button variant="ghost" className="gap-1 hover:cursor-pointer">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {trendingAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>

        {/* Popular Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All Time Popular</h2>
            <Link prefetch={true} href="/all-time-popular">
              <Button variant="ghost" className="gap-1 hover:cursor-pointer">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {popularAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>

        {/* Top Rated Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Top 100</h2>
            <Link prefetch={true} href="/top-100-anime">
              <Button variant="ghost" className="gap-1 hover:cursor-pointer">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {topRatedAnime.map((anime, index) => (
              <div key={anime.id} className="relative">
                <div
                  className="z-20 absolute -top-2.5 -left-2.5 md:-top-3 md:-left-3 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-white shadow"
                  style={{
                    backgroundColor: anime.coverImage?.color ?? "#3b82f6",
                  }}
                >
                  {index + 1}
                </div>
                <AnimeCard anime={anime} />
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Premieres */}
        <section className="pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Upcoming Premieres</h2>
            <Link prefetch={true} href="/schedule">
              <Button variant="ghost" className="gap-1 hover:cursor-pointer">
                View Schedule <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {upcomingPremieres.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {upcomingPremieres.map((schedule: AiringSchedule) => (
                <AnimeCard key={schedule.id} anime={schedule.media} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No upcoming premieres found at this time.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
