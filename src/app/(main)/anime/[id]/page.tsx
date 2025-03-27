import { Suspense } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
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
import { GenreQueries } from "@/lib/anilist/queries/genre";
import { formatFormat, formatStatus } from "@/lib/anilist/utils/formatters";

export const experimental_ppr = true;
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

  const data = await GenreQueries.getById(id);
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
      <div className="container py-8 md:py-12 mx-auto max-w-7xl">
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
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Cover Image and Stats Column */}
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="w-full max-w-[300px] mx-auto md:mx-0">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-xl border border-border/50 group hover:shadow-2xl transition-all duration-300">
                <Image
                  src={anime.coverImage.large || ""}
                  alt={title}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, 300px"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3.5 p-4 bg-card rounded-lg border border-border shadow-sm">
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
              <div className="mt-6 flex flex-col gap-2.5 items-center md:items-start p-4 bg-card rounded-lg border border-border shadow-sm">
                <h3 className="mb-2 font-semibold text-sm bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  External Links
                </h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {anime.externalLinks.slice(0, 4).map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-muted rounded-full hover:bg-gradient-to-r hover:from-primary hover:to-purple-400 transition-all"
                    >
                      {link.site} <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-400 to-purple-400 bg-clip-text text-transparent">
              {title}
            </h1>

            {anime.title.native && (
              <h2 className="mb-4 text-lg sm:text-xl text-muted-foreground font-medium">
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
                    <Badge
                      variant="secondary"
                      className="text-xs hover:bg-gradient-to-r hover:from-primary hover:to-purple-400 transition-all"
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
                  {anime.season.charAt(0) + anime.season.slice(1).toLowerCase()}{" "}
                  {anime.seasonYear}
                </Badge>
              )}
            </div>

            <p className="mb-6 text-sm sm:text-base whitespace-pre-line text-muted-foreground leading-relaxed p-4 bg-muted/50 rounded-lg border border-border/50">
              {description}
            </p>

            <Tabs defaultValue="characters" className="mt-8">
              <TabsList className="w-full mb-6 grid grid-cols-3 h-12">
                <TabsTrigger
                  value="characters"
                  className="flex-1 hover:cursor-pointer"
                >
                  Characters
                </TabsTrigger>
                <TabsTrigger
                  value="relations"
                  className="flex-1 hover:cursor-pointer"
                >
                  Relations
                </TabsTrigger>
                <TabsTrigger
                  value="recommendations"
                  className="flex-1 hover:cursor-pointer"
                >
                  Recommendations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="characters">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {anime.characters &&
                  anime.characters.nodes &&
                  anime.characters.nodes.length > 0 ? (
                    anime.characters.nodes.map((character) => (
                      <Card
                        key={character.id}
                        className="w-full overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-lg">
                          <Image
                            src={character.image.medium || ""}
                            alt={character.name.full}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <p className="col-span-full text-center text-muted-foreground py-8 bg-muted/50 rounded-lg border border-border/50">
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
                    <p className="col-span-full text-center text-muted-foreground py-8 bg-muted/50 rounded-lg border border-border/50">
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
                    <p className="col-span-full text-center text-muted-foreground py-8 bg-muted/50 rounded-lg border border-border/50">
                      No recommendations available
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Trailer */}
            {anime.trailer && anime.trailer.site === "youtube" && (
              <div className="relative mt-12 p-6 bg-card rounded-lg border border-border shadow-md">
                <h3 className="mb-6 text-xl font-semibold text-primary">
                  Trailer
                </h3>
                <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg">
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
