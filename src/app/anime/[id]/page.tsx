import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getAnimeById } from "@/lib/db";

interface AnimeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnimeDetailPage(props: AnimeDetailPageProps) {
  const params = await props.params;
  const anime = await getAnimeById(params.id);

  if (!anime) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
            <Image
              src={anime.coverImage || ""}
              alt={anime.title}
              fill
              className="object-cover object-bottom"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{anime.title}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {anime.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
            <p className="text-muted-foreground">{anime.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Status</h3>
              <p className="text-muted-foreground capitalize">{anime.status}</p>
            </div>
            <div>
              <h3 className="font-medium">Episodes</h3>
              <p className="text-muted-foreground">{anime.episodeCount}</p>
            </div>
            <div>
              <h3 className="font-medium">Season</h3>
              <p className="text-muted-foreground">{anime.season}</p>
            </div>
            <div>
              <h3 className="font-medium">Rating</h3>
              <p className="text-muted-foreground">{anime.rating}/10</p>
            </div>
            {anime.airingDay && (
              <div>
                <h3 className="font-medium">Airing Day</h3>
                <p className="text-muted-foreground">{anime.airingDay}</p>
              </div>
            )}
            {anime.airingTime && (
              <div>
                <h3 className="font-medium">Airing Time</h3>
                <p className="text-muted-foreground">
                  {formatTime(anime.airingTime)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
