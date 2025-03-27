import { Link } from "next-view-transitions"
import { Badge } from "@/components/ui/badge"
import { formatFormat, formatStatus } from "@/lib/anilist/utils/formatters"
import { AnimeMedia } from "@/lib/anilist/utils/types"

export function AnimeHeader({ anime }: { anime: AnimeMedia }) {
  const title = anime.title.english || anime.title.romaji

  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-400 to-purple-400 bg-clip-text text-transparent">
        {title}
      </h1>

      {anime.title.native && (
        <h2 className="mb-4 text-lg sm:text-xl text-muted-foreground font-medium">{anime.title.native}</h2>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {anime.genres &&
          anime.genres.map((genre: string) => (
            <Link key={genre} href={`/genres/${encodeURIComponent(genre)}`}>
              <Badge
                variant="secondary"
                className="text-xs rounded-full hover:bg-gradient-to-r hover:from-primary hover:to-purple-400 transition-all"
              >
                {genre}
              </Badge>
            </Link>
          ))}

        <Badge variant="outline" className="text-xs">
          {formatStatus(anime.status)}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {formatFormat(anime.format)}
        </Badge>

        {anime.season && anime.seasonYear && (
          <Badge variant="outline" className="text-xs">
            {anime.season.charAt(0) + anime.season.slice(1).toLowerCase()} {anime.seasonYear}
          </Badge>
        )}
      </div>
    </>
  )
}

