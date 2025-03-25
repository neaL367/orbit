import { Link } from "next-view-transitions";
import Image from "next/image";
import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { formatStatus } from "@/lib/utils";

interface AnimeCardProps {
  anime: {
    id: number;
    title: {
      romaji: string;
      english: string | null;
      native: string;
    };
    coverImage: {
      large: string | null;
      medium: string | null;
    };
    genres: string[];
    averageScore: number | null;
    status: string;
    season?: string | null;
    seasonYear?: number | null;
  };
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const title = anime.title.english || anime.title.romaji;

  return (
    <Link href={`/anime/${anime.id}`}>
      <Card className="h-full overflow-hidden transition-all hover:scale-[1.02] hover:shadow-md bg-transparent">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
          <Image
            src={anime.coverImage.large || anime.coverImage.medium || ""}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover "
            priority
          />
          {anime.averageScore && anime.averageScore > 0 && (
            <div className="absolute right-2 top-2 rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
              {anime.averageScore}%
            </div>
          )}
        </div>
        <div className="mt-2.5">
          <h3 className="line-clamp-2 text-sm text-white ">{title}</h3>
        </div>
        {/* <CardContent className="p-3 hidden md:flex">
          <div className="flex flex-wrap gap-1">
            {anime.genres?.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs">
              {formatStatus(anime.status)}
            </Badge>
            {anime.season && anime.seasonYear && (
              <Badge variant="outline" className="text-xs">
                {anime.season.charAt(0) + anime.season.slice(1).toLowerCase()}{" "}
                {anime.seasonYear}
              </Badge>
            )}
          </div>
        </CardContent> */}
      </Card>
    </Link>
  );
}
