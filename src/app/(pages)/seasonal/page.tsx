"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AnimeCard } from "@/components/anime-card";
import type { AnimeMedia } from "@/lib/types";
import { SEASONAL_ANIME_QUERY } from "@/app/graphql/queries/seasonal";

const SEASONS = ["winter", "spring", "summer", "fall"] as const;
type Season = (typeof SEASONS)[number];

const SEASON_COLORS = {
  winter: "from-blue-500 to-cyan-300",
  spring: "from-pink-500 to-pink-300",
  summer: "from-orange-500 to-amber-300",
  fall: "from-red-500 to-orange-300",
};

const FORMAT_ORDER = [
  "TV",
  "MOVIE",
  "OVA",
  "ONA",
  "SPECIAL",
  "MUSIC",
  "TV_SHORT",
  "UNKNOWN",
];

function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  let season: Season;
  if (month >= 1 && month <= 3) {
    season = "winter";
  } else if (month >= 4 && month <= 6) {
    season = "spring";
  } else if (month >= 7 && month <= 9) {
    season = "summer";
  } else {
    season = "fall";
  }

  return { year, season };
}

export default function SeasonalPage() {
  const currentSeason = getCurrentSeason();
  const [selectedYear, setSelectedYear] = useState(currentSeason.year);
  const [selectedSeason, setSelectedSeason] = useState<Season>(
    currentSeason.season.toLowerCase() as Season
  );

  function getNextSeason(season: Season, year: number) {
    const index = SEASONS.indexOf(season);
    return index === SEASONS.length - 1
      ? { season: SEASONS[0], year: year + 1 }
      : { season: SEASONS[index + 1], year };
  }

  function getPreviousSeason(season: Season, year: number) {
    const index = SEASONS.indexOf(season);
    return index === 0
      ? { season: SEASONS[SEASONS.length - 1], year: year - 1 }
      : { season: SEASONS[index - 1], year };
  }

  function formatSeasonName(season: string) {
    return season.charAt(0).toUpperCase() + season.slice(1);
  }

  function getSeasonEmoji(season: Season) {
    switch (season) {
      case "winter":
        return "❄️";
      case "spring":
        return "🌸";
      case "summer":
        return "☀️";
      case "fall":
        return "🍂";
      default:
        return "";
    }
  }

  const nextSeasonData = getNextSeason(selectedSeason, selectedYear);
  const prevSeasonData = getPreviousSeason(selectedSeason, selectedYear);

  const { data, loading, error } = useQuery(SEASONAL_ANIME_QUERY, {
    variables: {
      season: selectedSeason.toUpperCase(),
      year: selectedYear,
      page: 1,
      perPage: 50,
      isAdult: false,
    },
  });

  const animeList: AnimeMedia[] = data?.Page?.media || [];

  const groupedAnime: Record<string, AnimeMedia[]> = animeList.reduce(
    (acc, anime) => {
      const format = anime.format ?? "UNKNOWN";
      if (!acc[format]) acc[format] = [];
      acc[format].push(anime);
      return acc;
    },
    {} as Record<string, AnimeMedia[]>
  );

  const sortedEntries = Object.entries(groupedAnime).sort(
    ([a], [b]) => FORMAT_ORDER.indexOf(a) - FORMAT_ORDER.indexOf(b)
  );

  const isCurrentSeason =
    selectedSeason === currentSeason.season.toLowerCase() &&
    selectedYear === currentSeason.year;

  return (
    <div className="">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to home</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white">Seasonal Anime</h1>
      </div>

      {/* Season Card */}
      <Card className="w-full mb-8 overflow-hidden border shadow-md">
        <div
          className={`bg-gradient-to-r ${SEASON_COLORS[selectedSeason]} h-2`}
        />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <span className="text-4xl">{getSeasonEmoji(selectedSeason)}</span>
              <div className="flex max-md:items-center flex-col gap-2">
                <h2 className="flex gap-2 text-2xl md:text-3xl font-bold">
                  {formatSeasonName(selectedSeason)} {selectedYear}
                </h2>
                <p className="text-muted-foreground">
                  {isCurrentSeason ? (
                    <Badge className="bg-white text-primary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Current Season
                    </Badge>
                  ) : (
                    "Seasonal anime collection"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const { season, year } = getPreviousSeason(
                    selectedSeason,
                    selectedYear
                  );
                  setSelectedSeason(season);
                  setSelectedYear(year);
                }}
                className="rounded-full py-0"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">
                  {formatSeasonName(prevSeasonData.season)}
                </span>
                <span className="sm:hidden">Prev</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const { season, year } = getNextSeason(
                    selectedSeason,
                    selectedYear
                  );
                  setSelectedSeason(season);
                  setSelectedYear(year);
                }}
                className="rounded-full py-0"
              >
                <span className="hidden sm:inline">
                  {formatSeasonName(nextSeasonData.season)}
                </span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Year and Season */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Select Year</h3>
        </div>
        <Tabs
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(Number(value))}
          className="mb-6"
        >
          <TabsList className="h-10 p-1">
            {[...Array(5)].map((_, i) => {
              const year = currentSeason.year - 2 + i;
              return (
                <TabsTrigger
                  key={year}
                  value={year.toString()}
                  className="text-xs md:text-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-primary"
                >
                  {year}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Select Season</h3>
        </div>
        <Tabs
          value={selectedSeason}
          onValueChange={(value) => setSelectedSeason(value as Season)}
        >
          <TabsList className="grid gap-x-2 grid-cols-4 w-full h-max p-2">
            {SEASONS.map((season) => (
              <TabsTrigger
                key={season}
                value={season}
                className="text-xs md:text-sm flex flex-col gap-2 p-2 transition-all duration-300 hover:cursor-pointer hover:bg-white hover:text-zinc-950 data-[state=active]:bg-primary/30 data-[state=active]:text-white"
              >
                <span>{getSeasonEmoji(season)}</span>
                <span>{formatSeasonName(season)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Anime Grouped by Format */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            Loading anime for {formatSeasonName(selectedSeason)} {selectedYear}
            ...
          </p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">
          Failed to load seasonal anime: {error.message}
        </div>
      ) : animeList.length > 0 ? (
        <div className="space-y-14">
          {sortedEntries.map(([format, list]) => (
            <div key={format} className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{format}</h3>
                <Badge variant="secondary">{list.length}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {list.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-xl">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">
            No anime found for {formatSeasonName(selectedSeason)} {selectedYear}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            This could be because the season hasn&apos;t started yet, or
            there&apos;s no data available. Try selecting a different season or
            year.
          </p>
        </div>
      )}
    </div>
  );
}
