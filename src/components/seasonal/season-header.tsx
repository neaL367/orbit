import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { 
  Season, 
  SEASON_COLORS, 
  formatSeasonName, 
  getSeasonEmoji, 
  getNextSeason, 
  getPreviousSeason 
} from "../../app/(pages)/seasonal/utils/season-utils";

interface SeasonHeaderProps {
  selectedSeason: Season;
  selectedYear: number;
  setSelectedSeason: (season: Season) => void;
  setSelectedYear: (year: number) => void;
  isCurrentSeason: boolean;
}

export function SeasonHeader({
  selectedSeason,
  selectedYear,
  setSelectedSeason,
  setSelectedYear,
  isCurrentSeason,
}: SeasonHeaderProps) {
  const nextSeasonData = getNextSeason(selectedSeason, selectedYear);
  const prevSeasonData = getPreviousSeason(selectedSeason, selectedYear);

  return (
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
  );
}