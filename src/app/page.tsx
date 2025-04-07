import Link from "next/link";
import {
  ChevronRight,
  TrendingUp,
  Star,
  Users,
  Calendar,
  Sparkles,
} from "lucide-react";

import { AnimeCard } from "@/components/anime-card";
import { Button } from "@/components/ui/button";

import type { AiringSchedule } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { getTrendingAnime } from "./services/trending-anime";
import { getAllTimePopularAnime } from "./services/all-time-popular";
import { getTopRatedAnime } from "./services/top-rated-anime";
import { getAiringAnime } from "./services/airing-anime";

export default async function HomePage() {
  // Fetch data for each section
  const { media: trendingAnime } = await getTrendingAnime(1, 6);
  const { media: popularAnime } = await getAllTimePopularAnime(1, 6);
  const { media: topRatedAnime } = await getTopRatedAnime(1, 6);

  // Fetch upcoming premieres (first episodes)
  const { schedules } = await getAiringAnime(1, 6, true);
  const upcomingPremieres = schedules
    .filter((schedule: AiringSchedule) => schedule.episode === 1)
    .slice(0, 6);

  return (
    <div className="">
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="py-12">
          <div className="max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">
              Discover Anime
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Explore the latest trending, popular, and top-rated anime all in
              one place
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/trending">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending Now
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/schedule">
                  <Calendar className="h-4 w-4 mr-2" />
                  Airing Schedule
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Trending Now</h2>
            </div>
            <Link prefetch={true} href="/trending">
              <Button
                variant="ghost"
                className="gap-1 hover:cursor-pointer rounded-full"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {trendingAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>

        {/* Popular Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">All Time Popular</h2>
            </div>
            <Link prefetch={true} href="/all-time-popular">
              <Button
                variant="ghost"
                className="gap-1 hover:cursor-pointer rounded-full"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {popularAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>

        {/* Top Rated Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl font-bold">Top 100</h2>
            </div>
            <Link prefetch={true} href="/top-100-anime">
              <Button
                variant="ghost"
                className="gap-1 hover:cursor-pointer rounded-full"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {topRatedAnime.map((anime, index) => (
              <div key={anime.id} className="relative">
                <div
                  className="z-20 absolute -top-2.5 -left-2.5 md:-top-3 md:-left-3 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md"
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
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Upcoming Premieres</h2>
            </div>
            <Link prefetch={true} href="/schedule">
              <Button
                variant="ghost"
                className="gap-1 hover:cursor-pointer rounded-full"
              >
                View Schedule <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {upcomingPremieres.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {upcomingPremieres.map((schedule: AiringSchedule) => (
                <AnimeCard key={schedule.id} anime={schedule.media} />
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium mb-2">
                  No upcoming premieres found
                </p>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Check back later for new anime premieres or view the full
                  schedule
                </p>
                <Button asChild className="mt-6 rounded-full">
                  <Link href="/schedule">View Schedule</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
