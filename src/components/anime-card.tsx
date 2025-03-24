import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Anime } from "@/types"

interface AnimeCardProps {
  anime: Anime
}

export function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/anime/${anime.id}`}>
        <div className="aspect-[3/4] relative">
          <Image
            src={anime.coverImage || ""}
            alt={anime.title}
            fill
            className="object-cover object-bottom"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">{anime.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{anime.description}</p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-1 p-4 pt-0">
          {anime.genres.slice(0, 3).map((genre) => (
            <Badge key={genre} variant="secondary" className="text-xs">
              {genre}
            </Badge>
          ))}
        </CardFooter>
      </Link>
    </Card>
  )
}

