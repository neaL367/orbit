"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AnimeCard } from "@/components/anime-card";
import type { AnimeMedia } from "@/lib/types";
import { getCurrentSeason, getSeasonalAnime } from "@/app/services/seasonal-anime";

const SEASONS = ["winter", "spring", "summer", "fall"] as const;
type Season = (typeof SEASONS)[number];

// Season colors for visual distinction
const SEASON_COLORS = {
  winter: "from-blue-500 to-cyan-300",
  spring: "from-pink-500 to-pink-300",
  summer: "from-orange-500 to-amber-300",
  fall: "from-red-500 to-orange-300",
};

export default function SeasonalPage() {
  const currentSeason = getCurrentSeason();
  const [selectedYear, setSelectedYear] = useState(currentSeason.year);
  const [selectedSeason, setSelectedSeason] = useState<Season>(
    currentSeason.season.toLowerCase() as Season
  );
  const [animeList, setAnimeList] = useState<AnimeMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextSeasonData, setNextSeasonData] = useState<{
    season: Season;
    year: number;
  }>({
    season: getNextSeason(selectedSeason, selectedYear).season,
    year: getNextSeason(selectedSeason, selectedYear).year,
  });
  const [prevSeasonData, setPrevSeasonData] = useState<{
    season: Season;
    year: number;
  }>({
    season: getPreviousSeason(selectedSeason, selectedYear).season,
    year: getPreviousSeason(selectedSeason, selectedYear).year,
  });

  // Get the next season and year
  function getNextSeason(
    season: Season,
    year: number
  ): { season: Season; year: number } {
    const seasonIndex = SEASONS.indexOf(season);
    if (seasonIndex === SEASONS.length - 1) {
      return { season: SEASONS[0], year: year + 1 };
    }
    return { season: SEASONS[seasonIndex + 1], year };
  }

  // Get the previous season and year
  function getPreviousSeason(
    season: Season,
    year: number
  ): { season: Season; year: number } {
    const seasonIndex = SEASONS.indexOf(season);
    if (seasonIndex === 0) {
      return { season: SEASONS[SEASONS.length - 1], year: year - 1 };
    }
    return { season: SEASONS[seasonIndex - 1], year };
  }

  // Format season name for display
  function formatSeasonName(season: string): string {
    return season.charAt(0).toUpperCase() + season.slice(1);
  }

  // Get season emoji
  function getSeasonEmoji(season: Season): string {
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

  // Load anime data when season or year changes
  useEffect(() => {
    async function loadSeasonalAnime() {
      setIsLoading(true);
      try {
        const { media } = await getSeasonalAnime(
          selectedSeason,
          selectedYear
        );
        setAnimeList(media);
      } catch (error) {
        console.error("Error loading seasonal anime:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSeasonalAnime();

    // Update next and previous season data
    setNextSeasonData(getNextSeason(selectedSeason, selectedYear));
    setPrevSeasonData(getPreviousSeason(selectedSeason, selectedYear));
  }, [selectedSeason, selectedYear]);

  // Handle season navigation
  const goToNextSeason = () => {
    const { season, year } = nextSeasonData;
    setSelectedSeason(season);
    setSelectedYear(year);
  };

  const goToPreviousSeason = () => {
    const { season, year } = prevSeasonData;
    setSelectedSeason(season);
    setSelectedYear(year);
  };

  const isCurrentSeason =
    selectedSeason === currentSeason.season.toLowerCase() &&
    selectedYear === currentSeason.year;

  return (
    <div className="">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to home</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white">Seasonal Anime</h1>
      </div>

      {/* Season Header Card */}
      <Card className="w-full mb-8 overflow-hidden border shadow-md">
        <div
          className={`bg-gradient-to-r ${SEASON_COLORS[selectedSeason]} h-2`}
        ></div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex  items-center gap-3">
              <span className="text-4xl">{getSeasonEmoji(selectedSeason)}</span>
              <div className="flex flex-col gap-2">
                <h2 className="flex  gap-2 text-2xl md:text-3xl font-bold">
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
                onClick={goToPreviousSeason}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">
                  {formatSeasonName(prevSeasonData.season)}
                </span>
                <span className="sm:hidden">Prev</span>
              </Button>

              <Button
                variant="outline"
                onClick={goToNextSeason}
                className="rounded-full"
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

      {/* Year and Season Selection */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Select Year</h3>
        </div>

        <Tabs
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
          className="mb-6"
        >
          <TabsList className="h-10 p-1">
            {[...Array(5)].map((_, i) => {
              const year = currentSeason.year - 2 + i;
              return (
                <TabsTrigger
                  key={year}
                  value={year.toString()}
                  className="text-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-primary"
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
                className="text-sm flex flex-col gap-2 p-2 transition-all duration-300 hover:cursor-pointer hover:bg-white hover:text-zinc-950 data-[state=active]:bg-primary/30 data-[state=active]:text-white"
              >
                <span>{getSeasonEmoji(season)}</span>
                <span>{formatSeasonName(season)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Anime Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            Loading anime for {formatSeasonName(selectedSeason)} {selectedYear}
            ...
          </p>
        </div>
      ) : animeList.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Results</h3>
            <Badge variant="outline" className="rounded-full">
              {animeList.length} anime found
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {animeList.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </>
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
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={goToPreviousSeason}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Season
            </Button>
            <Button
              variant="outline"
              onClick={goToNextSeason}
              className="rounded-full"
            >
              Next Season
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
