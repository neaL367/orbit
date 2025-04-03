import {
  Calendar,
  Clock,
  Star,
  Users,
  Video,
  ExternalLink,
  Info,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAnimeDetails, getTimeUntilAiring } from "@/lib/api";
import Image from "next/image";
import { Link } from "next-view-transitions";

export async function AnimeDetails({ id }: { id: string }) {
  const anime = await fetchAnimeDetails(id);

  if (!anime) {
    return <div>Anime not found</div>;
  }

  const title =
    anime.title.userPreferred ||
    anime.title.english ||
    anime.title.romaji ||
    "";

  return (
    <div className="min-h-screen pb-12">
      {/* Banner with overlay */}
      {anime.bannerImage ? (
        <div className="relative w-full h-[150px] sm:h-[380px] overflow-hidden mb-12">
          <Image
            src={anime.bannerImage || ""}
            alt={title}
            fill
            priority
            className="object-cover rounded-t-lg object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        </div>
      ) : null}
      <div className="w-full">
        {/* Main Content */}
        <div className="mt-6 md:mt-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
            {/* Left Column - Details */}
            <div className="space-y-6">
              {/* Cover Image - Moved to left column */}
              <div className="shrink-0 z-10 w-full self-start lg:hidden">
                <div className="overflow-hidden aspect-[2/3] rounded-xl shadow-xl border-4 border-background w-full lg:max-w-[220px] mx-auto">
                  <Image
                    src={anime.coverImage.large || ""}
                    alt={title}
                    className="h-full w-full object-cover rounded-xl"
                    width={500}
                    height={750}
                    quality={90}
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </div>

              {/* Desktop Cover Image - Only visible on large screens */}
              <div className="hidden lg:block shrink-0 z-10 w-full self-start">
                <div className="overflow-hidden aspect-[2/3] rounded-lg shadow-xl border-4 border-background">
                  <Image
                    src={anime.coverImage.large || ""}
                    alt={title}
                    className="h-full w-full object-cover"
                    width={500}
                    height={750}
                    quality={90}
                    priority
                  />
                </div>
              </div>

              {/* Basic Details Card */}
              <div className="space-y-3 rounded-xl border p-4 bg-card">
                <h3 className="font-semibold text-sm">Anime Details</h3>
                <DetailItem label="Format" value={anime.format} />
                <Separator />
                <DetailItem label="Episodes" value={anime.episodes || "?"} />
                <Separator />
                <DetailItem
                  label="Duration"
                  value={anime.duration ? `${anime.duration} min` : "?"}
                />
                <Separator />
                <DetailItem label="Status" value={anime.status || ""} />
                <Separator />
                <DetailItem
                  label="Season"
                  value={
                    anime.season && anime.seasonYear
                      ? `${
                          anime.season.charAt(0).toUpperCase() +
                          anime.season.slice(1)
                        } ${anime.seasonYear}`
                      : "?"
                  }
                />

                {anime.source && (
                  <>
                    <Separator />
                    <DetailItem label="Source" value={anime.source} />
                  </>
                )}

                {anime.countryOfOrigin && (
                  <>
                    <Separator />
                    <DetailItem label="Country" value={anime.countryOfOrigin} />
                  </>
                )}
              </div>

              {/* Genres Card */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="rounded-xl border p-4 bg-card">
                  <h3 className="font-semibold text-sm mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre, index) => (
                      <Link
                        key={`${genre}-${index}`}
                        href={`/genres/${genre}`}
                        className="px-2.5 py-1 text-xs border rounded-full bg-zinc-800 text-gray-300 hover:bg-gradient-to-r hover:from-primary hover:to-purple-400 hover:text-white transition-all"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Studios Card */}
              {anime.studios &&
                anime.studios.nodes &&
                anime.studios.nodes.length > 0 && (
                  <div className="rounded-xl border p-4 bg-card">
                    <h3 className="font-semibold text-sm mb-3">Studios</h3>
                    <div className="flex flex-wrap gap-2">
                      {anime.studios.nodes.map((studio, index) => (
                        <Badge key={`${studio.id}-${index}`} variant="outline">
                          {studio.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* External Links */}
              {anime.externalLinks && anime.externalLinks.length > 0 && (
                <div className="rounded-xl border p-4 bg-card">
                  <h3 className="font-semibold text-sm mb-3">External Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.externalLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs px-3 py-1.5 border-0 bg-zinc-800 rounded-md hover:bg-gradient-to-r hover:from-primary hover:to-purple-400 transition-all"
                      >
                        {link.site} <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Main Content */}
            <div className="space-y-8">
              {/* Title & Meta - Positioned at the top of right column */}
              <div className="bg-background/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none mb-5 p-4 md:p-0 rounded-lg md:rounded-none">
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-purple-400 bg-clip-text text-transparent">
                  {title}
                </h1>
                {anime.title.native && (
                  <p className="mt-1 text-lg text-muted-foreground">
                    {anime.title.native}
                  </p>
                )}

                {/* Score, Popularity, Date & Duration */}
                <div className="flex flex-wrap gap-4 mt-3">
                  {anime.averageScore && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {anime.averageScore / 10}
                      </span>
                    </div>
                  )}
                  {anime.popularity && (
                    <div className="flex items-center gap-1">
                      <Users className="h-5 w-5" />
                      <span className="font-medium">
                        {anime.popularity.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {anime.startDate && anime.startDate.year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium">
                        {`${anime.startDate.year}-${
                          anime.startDate.month?.toString().padStart(2, "0") ||
                          "??"
                        }-${
                          anime.startDate.day?.toString().padStart(2, "0") ||
                          "??"
                        }`}
                      </span>
                    </div>
                  )}
                  {anime.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">{anime.duration} min</span>
                    </div>
                  )}
                </div>

                {/* Next Episode Info */}
                {anime.nextAiringEpisode && (
                  <div className="mt-3 py-1 w-fit rounded-full bg-card border flex items-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary via-purple-400 to-purple-400 bg-clip-text text-transparent px-3 py-1.5 rounded-full">
                      <Info className="h-4 w-4 stroke-white" />
                      <span className="font-medium text-sm">
                        Episode {anime.nextAiringEpisode.episode} in{" "}
                        {getTimeUntilAiring(anime.nextAiringEpisode.airingAt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {anime.description && (
                <div className="bg-card rounded-xl p-6 border">
                  <h3 className="font-semibold text-sm mb-4">Synopsis</h3>
                  <div
                    className="text-muted-foreground prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-foreground prose-a:text-primary"
                    dangerouslySetInnerHTML={{ __html: anime.description }}
                  />
                </div>
              )}

              {/* Trailer */}
              {anime.trailer && (
                <div className="bg-card rounded-xl p-6 border">
                  <h3 className="font-semibold text-sm mb-4">Trailer</h3>
                  <div className="aspect-video w-full overflow-hidden rounded-lg">
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
              )}

              {/* Tabs for Characters, Staff, Relations */}
              <div className="bg-card rounded-xl p-6 border">
                <Tabs defaultValue="characters" className="w-full">
                  <TabsList className="w-full mb-6 grid grid-cols-1 md:grid-cols-3 gap-2 h-auto">
                    <TabsTrigger value="characters">Characters</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="recommendations">
                      Recommendations
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="characters" className="mt-4">
                    {anime.characters &&
                    anime.characters.edges &&
                    anime.characters.edges.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {anime.characters.edges.slice(0, 8).map((edge) => (
                          <div
                            key={edge.node.id}
                            className="flex flex-col overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all"
                          >
                            {/* Character Image */}
                            <div className="relative aspect-square">
                              <Image
                                src={edge.node.image.large || ""}
                                alt={edge.node.name.full}
                                className="object-cover"
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            </div>
                            {/* Character Details */}
                            <div className="p-3 flex flex-col flex-grow items-center">
                              <h3 className="font-medium text-sm line-clamp-1">
                                {edge.node.name.full}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {edge.role}
                              </p>
                            </div>
                            {/* Voice Actor Info */}
                            {edge.voiceActors &&
                              edge.voiceActors.length > 0 && (
                                <div className="border-t p-2 flex items-center justify-center gap-2">
                                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                    <Image
                                      src={
                                        edge.voiceActors[0].image.large || ""
                                      }
                                      alt={edge.voiceActors[0].name.full}
                                      fill
                                      className="object-cover rounded-full border-2 border-primary/20 transition-transform duration-300 hover:scale-105"
                                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                      priority
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {edge.voiceActors[0].name.full}
                                  </span>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        No character information available
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="staff" className="mt-4">
                    {anime.staff &&
                    anime.staff.edges &&
                    anime.staff.edges.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {anime.staff.edges
                          .slice(0, 8)
                          .map((edge, index: number) => (
                            <div
                              key={`${edge.node.id}-${index}`}
                              className="overflow-hidden rounded-lg border hover:shadow-md transition-all"
                            >
                              {/* Staff Image */}
                              <div className="relative aspect-square">
                                <Image
                                  src={edge.node.image?.large || "" || ""}
                                  alt={edge.node.name.full}
                                  className="object-cover"
                                  fill
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                              </div>
                              <div className="p-3 flex flex-col justify-center items-center">
                                <h3 className="line-clamp-1 font-medium text-sm">
                                  {edge.node.name.full}
                                </h3>
                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                  {edge.role}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        No staff information available
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="recommendations" className="mt-4">
                    {anime.recommendations &&
                    anime.recommendations.nodes.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {anime.recommendations.nodes.map((nodes) => (
                          <Link
                            key={nodes.mediaRecommendation?.id}
                            href={`/anime/${nodes.mediaRecommendation?.id}`}
                            className="overflow-hidden rounded-lg border hover:shadow-md transition-all"
                          >
                            <div className="h-full transition-all hover:scale-[1.02]">
                              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
                                <Image
                                  src={
                                    nodes.mediaRecommendation?.coverImage
                                      .large ||
                                    "" ||
                                    "/placeholder.svg"
                                  }
                                  alt={
                                    nodes.mediaRecommendation?.title.english ||
                                    nodes.mediaRecommendation?.title.romaji ||
                                    ""
                                  }
                                  fill
                                  className="object-cover brightness-85"
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                />
                              </div>
                              <div className="p-3">
                                <h3 className="line-clamp-2 font-semibold text-sm">
                                  {nodes.mediaRecommendation?.title.english ||
                                    nodes.mediaRecommendation?.title.romaji}
                                </h3>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        No recommendations available
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 
    Helper component for displaying a detail row.
    You can move this to a separate file if needed.
  */
interface DetailItemProps {
  label: string;
  value: string | number;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
