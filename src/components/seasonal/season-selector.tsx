import { Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Season, SEASONS, formatSeasonName, getSeasonEmoji } from "../../app/(pages)/seasonal/utils/season-utils";

interface SeasonSelectorProps {
  selectedSeason: Season;
  selectedYear: number;
  setSelectedSeason: (season: Season) => void;
  setSelectedYear: (year: number) => void;
  currentSeason: { year: number; season: Season };
}

export function SeasonSelector({
  selectedSeason,
  selectedYear,
  setSelectedSeason,
  setSelectedYear,
  currentSeason,
}: SeasonSelectorProps) {
  return (
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
  );
}