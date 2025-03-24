import { Link } from "next-view-transitions";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import { Anime } from "@/types";

interface ScheduleDayProps {
  day: string;
  animeList: Anime[];
}

export function ScheduleDay({ day, animeList }: ScheduleDayProps) {
  if (!animeList.length || animeList.length == 0) {
    return (
      <div className="space-y-4 mt-12">
        <h2 className="text-2xl font-bold">{day}</h2>
        <p className="text-muted-foreground">No anime scheduled for this day</p>
      </div>
    );
  }

  // Sort by airing time
  const sortedAnime = [...animeList].sort((a, b) => {
    if (!a.airingTime) return 1;
    if (!b.airingTime) return -1;
    return a.airingTime.localeCompare(b.airingTime);
  });

  return (
    <div className="space-y-4  mt-12 ">
      <h2 className="text-2xl font-bold">{day}</h2>
      <div className="space-y-3">
        {sortedAnime.map((anime) => (
          <Card key={anime.id} className="overflow-hidden">
            <CardContent className="p-0">
              <Link
                href={`/anime/${anime.id}`}
                className="flex items-center gap-4 p-4"
              >
                <div className="relative h-16 w-12 flex-shrink-0">
                  <Image
                    src={anime.coverImage || ""}
                    alt={anime.title}
                    fill
                    className="object-cover rounded-sm"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-1">{anime.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {anime.airingTime && (
                      <span className="text-sm text-muted-foreground">
                        {formatTime(anime.airingTime)}
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {anime.status}
                    </Badge>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
