import Image from "next/image";
import { Link } from "next-view-transitions";
import { Play, Clock, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StreamingPlatforms } from "../streaming-platforms";
import { ScheduleItem } from "@/anilist/modal/response";

export default function ScheduleCard({ anime }: { anime: ScheduleItem }) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all rounded-lg">
      <CardContent className="p-0">
        <div className="flex group-hover:bg-gradient-to-r group-hover:from-zinc-900/10 group-hover:to-zinc-400/10 transition-all">
          <div className="w-24 h-32 shrink-0 relative overflow-hidden">
            <Image
              src={anime.coverImage.medium || ""}
              alt={anime.title.english || anime.title.romaji}
              className="w-full h-full object-contain group-hover:scale-105 transition-all duration-300 brightness-85 rounded-lg"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority
            />
            <Link
              href={`/anime/${anime.id}`}
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Play className="w-8 h-8 text-white" />
            </Link>
          </div>
          <div className="p-3 flex flex-col justify-between flex-1">
            <div>
              <Link href={`/anime/${anime.id}`}>
                <h3 className="font-medium line-clamp-1 transition-colors">
                  {anime.title.english || anime.title.romaji}
                </h3>
              </Link>
              {anime.isAdult && (
                <span className="inline-block bg-red-500 text-white text-xs px-1.5 py-0.5 rounded mt-1 mr-1">
                  NSFW
                </span>
              )}
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{anime.airingTime} </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-sm">
                <div className="flex items-center mr-3">
                  <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span>{anime.duration} min</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span className="group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-400 group-hover:text-white group-hover:px-2 group-hover:rounded-full transition-all">
                    Ep {anime.episode}
                  </span>
                </div>
              </div>

              <StreamingPlatforms anime={anime} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
