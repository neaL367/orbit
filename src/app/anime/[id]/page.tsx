import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimeById } from "@/lib/anilist";
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

  const data = await getAnimeById(id);
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
      <div className="flex flex-col justify-center items-center">
        {/* Banner Image */}
        {anime.bannerImage && (
          <div className="relative h-[200px] w-full overflow-hidden">
            <Image
              src={anime.bannerImage || ""}
              alt={title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-blur-sm" />
          </div>
        )}

        <div className="container py-8 px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image */}
            <div className="mx-auto w-full max-w-[250px] md:mx-0">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={anime.coverImage.large || anime.coverImage.medium || ""}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Stats */}
              <div className="mt-4 space-y-2">
                {anime.averageScore && anime.averageScore > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{anime.averageScore}% Rating</span>
                  </div>
                )}

                {anime.popularity > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{anime.popularity.toLocaleString()} Users</span>
                  </div>
                )}

                {anime.episodes && anime.episodes > 0 && (
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    <span>{anime.episodes} Episodes</span>
                  </div>
                )}

                {anime.duration && anime.duration > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{anime.duration} mins per ep</span>
                  </div>
                )}

                {anime.startDate?.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {startDate} - {endDate}
                    </span>
                  </div>
                )}
              </div>

              {/* External Links */}
              {anime.externalLinks && anime.externalLinks.length > 0 && (
                <div className="mt-4">
                  <h3 className="mb-2 font-semibold">External Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.externalLinks.slice(0, 4).map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        {link.site} <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="mb-2 text-3xl font-bold">{title}</h1>

              {anime.title.native && (
                <h2 className="mb-4 text-xl text-muted-foreground">
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
                      <Badge variant="secondary">{genre}</Badge>
                    </Link>
                  ))}

                <Badge variant="outline">{formatStatus(anime.status)}</Badge>
                <Badge variant="outline">{formatFormat(anime.format)}</Badge>

                {anime.season && anime.seasonYear && (
                  <Badge variant="outline">
                    {anime.season.charAt(0) +
                      anime.season.slice(1).toLowerCase()}{" "}
                    {anime.seasonYear}
                  </Badge>
                )}
              </div>

              <p className="mb-6 whitespace-pre-line text-muted-foreground">
                {description}
              </p>

              <Tabs defaultValue="characters">
                <TabsList className="mb-4">
                  <TabsTrigger value="characters">Characters</TabsTrigger>
                  <TabsTrigger value="relations">Relations</TabsTrigger>
                  <TabsTrigger value="recommendations">
                    Recommendations
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="characters">
                  <div className="flex gap-5">
                    {anime.characters &&
                    anime.characters.nodes &&
                    anime.characters.nodes.length > 0 ? (
                      anime.characters.nodes.map((character) => (
                        <Card key={character.id} className="w-fit">
                          <div className="relative h-[150px] w-[150px] overflow-hidden rounded-t-lg">
                            <Image
                              src={character.image.medium || ""}
                              alt={character.name.full}
                              fill
                              className="object-cover"
                              priority
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                          <CardContent className="p-3">
                            <h3 className="line-clamp-1 font-semibold">
                              {character.name.full}
                            </h3>
                            <p className="text-sm text-muted-foreground">
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
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                priority
                              />
                            </div>
                            <CardContent className="p-3">
                              <h3 className="line-clamp-1 font-semibold">
                                {relation.node.title.english ||
                                  relation.node.title.romaji}
                              </h3>
                              <p className="text-sm text-muted-foreground">
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
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
                                  rec.mediaRecommendation.coverImage.medium ||
                                  ""
                                }
                                alt={
                                  rec.mediaRecommendation.title.english ||
                                  rec.mediaRecommendation.title.romaji
                                }
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                priority
                              />
                            </div>
                            <CardContent className="p-3">
                              <h3 className="line-clamp-2 font-semibold">
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
                <div className="mt-8">
                  <h3 className="mb-4 text-xl font-semibold">Trailer</h3>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${anime.trailer.id}`}
                      title={`${title} Trailer`}
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
