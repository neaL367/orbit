import { Video } from "lucide-react";
import { AnimeMedia } from "@/lib/types";

export function Trailer({ anime }: { anime: AnimeMedia }) {
  if (!anime.trailer) return null;

  const title =
    anime.title?.userPreferred ||
    anime.title?.english ||
    anime.title?.romaji ||
    "Anime";

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border shadow-sm">
      <h3 className="font-semibold mb-4">Trailer</h3>
      <div className="aspect-video w-full overflow-hidden rounded-lg border">
        {anime.trailer.site === "youtube" && anime.trailer.id ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube-nocookie.com/embed/${anime.trailer.id}`}
            title={`${title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <Video className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
