"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchSeasonalAnime, getCurrentSeason } from "@/lib/api";
import { AnimeCard } from "@/components/anime-card";
import type { AnimeMedia } from "@/lib/types";

const SEASONS = ["winter", "spring", "summer", "fall"] as const;
type Season = (typeof SEASONS)[number];

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

  // Load anime data when season or year changes
  useEffect(() => {
    async function loadSeasonalAnime() {
      setIsLoading(true);
      try {
        const { media } = await fetchSeasonalAnime(
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

  return (
    <div className="w-full">
      <section className="py-8 flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold mb-4">Season Anime</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Discover seasonal anime
        </p>
      </section>

      {/* Season Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            className="px-2"
            onClick={goToPreviousSeason}
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            <span className="text-xs truncate max-w-12">
              {formatSeasonName(prevSeasonData.season)}
            </span>
          </Button>

          <div className="text-center px-1">
            <h2 className="text-base sm:text-xl font-bold">
              {formatSeasonName(selectedSeason)} {selectedYear}
            </h2>
            {selectedSeason === currentSeason.season.toLowerCase() &&
              selectedYear === currentSeason.year && (
                <span className="inline-block mt-1 bg-primary bg-gradient-to-r to-purple-400 text-primary-foreground px-1 py-0.5 rounded-full text-xs">
                  Current
                </span>
              )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="px-2"
            onClick={goToNextSeason}
          >
            <span className="text-xs truncate max-w-12">
              {formatSeasonName(nextSeasonData.season)}
            </span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* Season Tabs */}
        <Tabs
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
          className="mb-4"
        >
          <div className="flex flex-wrap items-center justify-center mb-2">
            {/* <span className="text-xs sm:text-sm font-medium mr-1 mb-1 sm:mb-0">
              Year:
            </span> */}
            <TabsList className="h-8">
              {[...Array(5)].map((_, i) => {
                const year = currentSeason.year - 2 + i;
                return (
                  <TabsTrigger
                    key={year}
                    value={year.toString()}
                    className="text-xs px-2 py-1"
                  >
                    {year}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </Tabs>

        <Tabs
          value={selectedSeason}
          onValueChange={(value) => setSelectedSeason(value as Season)}
        >
          <TabsList className="grid grid-cols-4 w-full h-8">
            {SEASONS.map((season) => (
              <TabsTrigger key={season} value={season} className="text-xs px-1">
                {formatSeasonName(season)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Anime Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[2/3] w-full bg-muted"></div>
              <CardContent className="p-2">
                <div className="h-3 w-3/4 bg-muted rounded mt-1"></div>
                <div className="h-2 w-1/2 bg-muted rounded mt-1"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : animeList.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {animeList.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-12">
          <h3 className="text-base sm:text-lg font-medium mb-2">
            No anime found for this season
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Try selecting a different season or year.
          </p>
        </div>
      )}
    </div>
  );
}
