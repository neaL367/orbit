import { Link } from "next-view-transitions";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Anime } from "@/types";

interface AnimeCardProps {
  anime: Anime;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg ">
      <Link href={`/anime/${anime.id}`}>
        <CardContent className="">
          <div className="aspect-[1/1] relative">
            <Image
              src={anime.coverImage || ""}
              alt={anime.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="p-4 hidden md:block">
            <h3 className="font-semibold line-clamp-1">{anime.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {anime.description}
            </p>
          </div>
        </CardContent>
        <CardFooter className="hidden md:flex flex-wrap gap-1 md:p-4 pt-0">
          {anime.genres.slice(0, 3).map((genre) => (
            <Badge key={genre} variant="secondary" className="text-xs">
              {genre}
            </Badge>
          ))}
        </CardFooter>
      </Link>
    </Card>
  );
}
