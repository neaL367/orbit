"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { AnimeMedia } from "@/lib/types";
import { SEASONAL_ANIME_QUERY } from "@/app/graphql/queries/seasonal";
import { SeasonHeader } from "../../../components/seasonal/season-header";
import { SeasonSelector } from "../../../components/seasonal/season-selector";
import { AnimeList } from "../../../components/seasonal/anime-list";
import { getCurrentSeason, Season } from "./utils/season-utils";

export default function SeasonalPage() {
  const currentSeason = getCurrentSeason();
  const [selectedYear, setSelectedYear] = useState(currentSeason.year);
  const [selectedSeason, setSelectedSeason] = useState<Season>(
    currentSeason.season
  );

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
  
  const isCurrentSeason =
    selectedSeason === currentSeason.season &&
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
      <SeasonHeader 
        selectedSeason={selectedSeason}
        selectedYear={selectedYear}
        setSelectedSeason={setSelectedSeason}
        setSelectedYear={setSelectedYear}
        isCurrentSeason={isCurrentSeason}
      />

      {/* Tabs: Year and Season */}
      <SeasonSelector
        selectedSeason={selectedSeason}
        selectedYear={selectedYear}
        setSelectedSeason={setSelectedSeason}
        setSelectedYear={setSelectedYear}
        currentSeason={currentSeason}
      />

      {/* Anime Grouped by Format */}
      <AnimeList 
        animeList={animeList}
        loading={loading}
        error={error}
        selectedSeason={selectedSeason}
        selectedYear={selectedYear}
      />
    </div>
  );
}
