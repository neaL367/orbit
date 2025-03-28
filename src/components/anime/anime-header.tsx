import { Link } from "next-view-transitions";
import { Badge } from "@/components/ui/badge";
import { formatFormat, formatStatus } from "@/anilist/utils/formatters";
import { AnimeMedia } from "@/anilist/modal/media";

export function AnimeHeader({ anime }: { anime: AnimeMedia }) {
  const title = anime.title.english || anime.title.romaji;

  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-400 to-purple-400 bg-clip-text text-transparent">
        {title}
      </h1>

      {anime.title.native && (
        <h2 className="mb-4 text-lg sm:text-xl text-muted-foreground font-medium">
          {anime.title.native}
        </h2>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className="text-xs border-0 bg-gradient-to-r from-primary to-purple-400 rounded-full"
        >
          {formatStatus(anime.status)}
        </Badge>
        <Badge variant="outline" className="text-xs rounded-full bg-zinc-800">
          {formatFormat(anime.format)}
        </Badge>

        {anime.season && anime.seasonYear && (
          <Badge variant="outline" className="text-xs rounded-full bg-zinc-800">
            {anime.season.charAt(0) + anime.season.slice(1).toLowerCase()}{" "}
            {anime.seasonYear}
          </Badge>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {anime.genres &&
          anime.genres.map((genre: string) => (
            <Link key={genre} href={`/genres/${encodeURIComponent(genre)}`}>
              <Badge
                variant="secondary"
                className="text-xs rounded-full bg-zinc-800 hover:bg-gradient-to-r hover:from-primary hover:to-purple-400 transition-all border-0"
              >
                {genre}
              </Badge>
            </Link>
          ))}
      </div>
    </>
  );
}
