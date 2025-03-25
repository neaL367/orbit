import { Suspense } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import AnilistQueries from "@/lib/anilist";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingAnimeDetails } from "@/components/loading-anime";
import {
  ExternalLink,
  Calendar,
  Clock,
  Star,
  Users,
  PlayCircle,
} from "lucide-react";
import { formatFormat, formatStatus } from "@/lib/utils";

interface AnimePageProps {
  params: Promise<{
    id: string;
  }>;
}


export default async function AnimePage(props: AnimePageProps) {
  const params = await props.params;

  const id = Number.parseInt(params.id, 10);

  if (isNaN(id)) {
    notFound();
  }

  const data = await AnilistQueries.getById(id);
  const anime = data?.data?.Media;

  if (!anime) {
    notFound();
  }

  // Format title for display
  const title = anime.title.english || anime.title.romaji;

  // Format description - remove HTML tags
  const description = anime.description
    ? anime.description.replace(/<[^>]*>/g, "")
    : "No description available.";

  // Format date
  const formatDate = (date?: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  }) => {
    if (!date || !date.year) return "TBA";
    return new Date(
      date.year,
      (date.month || 1) - 1,
      date.day || 1
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const startDate = formatDate(anime.startDate);
  const endDate =
    anime.status === "FINISHED" ? formatDate(anime.endDate) : "Ongoing";

  return (
    <Suspense fallback={<LoadingAnimeDetails />}>
      <div className="container mx-auto px-4 pb-8 max-w-7xl">
        {/* Banner Image */}
        {anime.bannerImage && (
          <div className="relative w-full h-[150px] sm:h-[200px] overflow-hidden mb-12">
            <Image
              src={anime.bannerImage || ""}
              alt={title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Cover Image and Stats Column */}
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="w-full max-w-[300px] mx-auto md:mx-0">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={anime.coverImage.large || ""}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 300px"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3.5">
              {anime.averageScore && anime.averageScore > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{anime.averageScore}% Rating</span>
                </div>
              )}

              {anime.popularity > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{anime.popularity.toLocaleString()} Users</span>
                </div>
              )}

              {anime.episodes && anime.episodes > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <PlayCircle className="h-4 w-4" />
                  <span>{anime.episodes} Episodes</span>
                </div>
              )}

              {anime.duration && anime.duration > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{anime.duration} mins per ep</span>
                </div>
              )}

              {anime.startDate?.year && (
                <div className="flex items-center gap-2 text-sm col-span-2 sm:col-span-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {startDate} - {endDate}
                  </span>
                </div>
              )}
            </div>

            {/* External Links */}
            {anime.externalLinks && anime.externalLinks.length > 0 && (
              <div className="mt-6 flex flex-col gap-2.5 items-center md:items-start ">
                <h3 className="mb-2 font-semibold text-sm">External Links</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {anime.externalLinks.slice(0, 4).map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {link.site} <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h1>

            {anime.title.native && (
              <h2 className="mb-4 text-lg sm:text-xl text-muted-foreground">
                {anime.title.native}
              </h2>
            )}

            <div className="mb-4 flex flex-wrap gap-2">
              {anime.genres &&
                anime.genres.map((genre) => (
                  <Link
                    key={genre}
                    href={`/genres/${encodeURIComponent(genre)}`}
                  >
                    <Badge variant="secondary" className="text-xs">
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
                  {anime.season.charAt(0) + anime.season.slice(1).toLowerCase()}{" "}
                  {anime.seasonYear}
                </Badge>
              )}
            </div>

            <p className="mb-6 text-sm sm:text-base whitespace-pre-line text-muted-foreground">
              {description}
            </p>

            <Tabs defaultValue="characters">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="characters" className="flex-1">
                  Characters
                </TabsTrigger>
                <TabsTrigger value="relations" className="flex-1">
                  Relations
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex-1">
                  Recommendations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="characters">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {anime.characters &&
                  anime.characters.nodes &&
                  anime.characters.nodes.length > 0 ? (
                    anime.characters.nodes.map((character) => (
                      <Card key={character.id} className="w-full">
                        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-lg">
                          <Image
                            src={character.image.medium || ""}
                            alt={character.name.full}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </div>
                        <CardContent className="p-3">
                          <h3 className="line-clamp-1 font-semibold text-sm">
                            {character.name.full}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {character.gender || "Character"}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="col-span-full text-center text-muted-foreground">
                      No character information available
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="relations">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {anime.relations &&
                  anime.relations.edges &&
                  anime.relations.edges.length > 0 ? (
                    anime.relations.edges.map((relation) => (
                      <Link
                        key={relation.node.id}
                        href={`/anime/${relation.node.id}`}
                      >
                        <Card className="h-full transition-all hover:scale-[1.02] hover:shadow-md">
                          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
                            <Image
                              src={relation.node.coverImage.medium || ""}
                              alt={
                                relation.node.title.english ||
                                relation.node.title.romaji
                              }
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                          </div>
                          <CardContent className="p-3">
                            <h3 className="line-clamp-1 font-semibold text-sm">
                              {relation.node.title.english ||
                                relation.node.title.romaji}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {relation.relationType.replace(/_/g, " ")}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <p className="col-span-full text-center text-muted-foreground">
                      No related anime available
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="recommendations">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {anime.recommendations &&
                  anime.recommendations.nodes &&
                  anime.recommendations.nodes.length > 0 ? (
                    anime.recommendations.nodes.map((rec) => (
                      <Link
                        key={rec.mediaRecommendation.id}
                        href={`/anime/${rec.mediaRecommendation.id}`}
                      >
                        <Card className="h-full transition-all hover:scale-[1.02] hover:shadow-md">
                          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
                            <Image
                              src={
                                rec.mediaRecommendation.coverImage.medium || ""
                              }
                              alt={
                                rec.mediaRecommendation.title.english ||
                                rec.mediaRecommendation.title.romaji
                              }
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                          </div>
                          <CardContent className="p-3">
                            <h3 className="line-clamp-2 font-semibold text-sm">
                              {rec.mediaRecommendation.title.english ||
                                rec.mediaRecommendation.title.romaji}
                            </h3>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <p className="col-span-full text-center text-muted-foreground">
                      No recommendations available
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Trailer */}
            {anime.trailer && anime.trailer.site === "youtube" && (
              <div className="relative mt-8">
                <h3 className="mb-4 text-xl font-semibold">Trailer</h3>
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${anime.trailer.id}`}
                    title={`${title} Trailer`}
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
