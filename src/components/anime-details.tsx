"use client";

import {
  Calendar,
  Clock,
  Star,
  Users,
  Video,
  ExternalLink,
  Info,
  // Heart,
  // Bookmark,
  // Share2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import { ANIME_DETAILS_QUERY } from "@/app/graphql/queries/detail";
import { useQuery } from "@apollo/client";
import { AnimeMedia } from "@/lib/types";
import AnimeDetailLoading from "@/app/(pages)/anime/[id]/[slug]/loading";

function getTimeUntilAiring(timestamp: number): string {
  const now = Date.now() / 1000;
  const timeUntil = timestamp - now;

  if (timeUntil <= 0) {
    return "Aired";
  }

  const days = Math.floor(timeUntil / (24 * 60 * 60));
  const hours = Math.floor((timeUntil % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((timeUntil % (60 * 60)) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function AnimeDetails({ id }: { id: string }) {
  const { data, loading, error } = useQuery(ANIME_DETAILS_QUERY, {
    variables: { id: id },
    notifyOnNetworkStatusChange: true,
  });

  if (loading && !data) return <AnimeDetailLoading />;
  if (error) return <p>Error: {error.message}</p>;

  const anime = data.Media as AnimeMedia;

  const title =
    anime.title.userPreferred ||
    anime.title.english ||
    anime.title.romaji ||
    "";

  const sourceMapping = {
    MANGA: "Manga",
    ORIGINAL: "Original",
    LIGHT_NOVEL: "Light Novel",
    NOVEL: "Novel",
    VISUAL_NOVEL: "Visual Novel",
    VIDEO_GAME: "Video Game",
    OTHER: "Other",
  };

  const statusMapping = {
    NOT_YET_RELEASED: "Not Yet Released",
    RELEASING: "Currently Releasing",
    FINISHED: "Finished",
  };

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-b from-background to-background/95">
      {/* Banner with overlay */}
      {anime.bannerImage ? (
        <div className="relative w-full h-[200px] sm:h-[450px] rounded-xl overflow-hidden">
          <Image
            src={anime.bannerImage || ""}
            alt={title}
            fill
            priority
            className="absolute object-cover"
            sizes="(min-width: 808px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        </div>
      ) : (
        <div className="relative w-full h-[200px] sm:h-[400px] rounded-t-xl bg-primary/20">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        </div>
      )}

      <div className="relative">
        {/* Main Content */}
        <div className="mt-[-100px] sm:mt-[-150px] relative z-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
            {/* Left Column - Details */}
            <div className="space-y-6">
              {/* Cover Image */}
              <div className="shrink-0 w-full self-start">
                <div className="overflow-hidden aspect-[2/3] rounded-xl shadow-xl border-4 border-background w-full max-w-[250px] mx-auto">
                  <Image
                    src={anime.coverImage.large || ""}
                    alt={title}
                    className="h-full w-full object-cover rounded-xl transition-transform duration-500 hover:scale-105"
                    width={500}
                    height={750}
                    quality={90}
                    priority
                    sizes="(max-width: 640px) 250px, 320px"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {/* <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-full"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  <span>Favorite</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-full"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  <span>Watch List</span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div> */}

              <div className="block lg:hidden bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border shadow-sm">
                <h1 className="text-2xl md:text-4xl font-bold text-white">
                  {title}
                </h1>
                {anime.title.native && (
                  <p className="mt-1 text-lg text-muted-foreground">
                    {anime.title.native}
                  </p>
                )}

                {/* Score, Popularity, Date & Duration */}
                <div className="flex flex-wrap gap-6 mt-4">
                  {anime.averageScore && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-yellow-500/10">
                        <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {anime.averageScore / 10}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Score
                        </div>
                      </div>
                    </div>
                  )}
                  {anime.popularity ? (
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {anime.popularity.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Popularity
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {anime.startDate && anime.startDate.year && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {`${anime.startDate.year}-${
                            anime.startDate.month
                              ?.toString()
                              .padStart(2, "0") || "??"
                          }-${
                            anime.startDate.day?.toString().padStart(2, "0") ||
                            "??"
                          }`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Release Date
                        </div>
                      </div>
                    </div>
                  )}
                  {anime.duration && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{anime.duration} min</div>
                        <div className="text-xs text-muted-foreground">
                          Per Episode
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Episode Info */}
                {anime.nextAiringEpisode && (
                  <div className="flex lg:hidden mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Info className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          Episode {anime.nextAiringEpisode.episode} airing in{" "}
                          {getTimeUntilAiring(anime.nextAiringEpisode.airingAt)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Next Episode
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {anime.description && (
                <div className="block lg:hidden bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border shadow-sm">
                  <h3 className="font-semibold mb-4">Synopsis</h3>
                  <div
                    className="text-muted-foreground prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-foreground prose-a:text-primary"
                    dangerouslySetInnerHTML={{ __html: anime.description }}
                  />
                </div>
              )}

              {/* Basic Details Card - Redesigned */}
              <div className="rounded-xl border bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
                <div className="bg-primary/20 p-4">
                  <h3 className="font-semibold">Anime Details</h3>
                </div>

                <div className="p-4 grid gap-4">
                  {/* Format & Episodes Group */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/30 rounded-lg p-3 flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">
                        Format
                      </span>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {anime.format || "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3 flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">
                        Episodes
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {anime.episodes || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Duration & Status Group */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {/* <div className="bg-muted/30 rounded-lg p-3 flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">
                        Duration
                      </span>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {anime.duration ? `${anime.duration} min` : "Unknown"}
                        </span>
                      </div>
                    </div> */}

                    {anime.source && (
                      <div className="bg-muted/30 rounded-lg p-3 flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">
                          Source
                        </span>
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">
                            {sourceMapping[
                              anime.source as keyof typeof sourceMapping
                            ] || anime.source}
                          </span>
                        </div>
                      </div>
                    )}

                    {anime.countryOfOrigin && (
                      <div className="bg-muted/30 rounded-lg p-3 flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">
                          Country
                        </span>
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">
                            {anime.countryOfOrigin}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Season & Source */}
                  <div className="bg-muted/30 rounded-lg p-3 flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1">
                      Season
                    </span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">
                        {anime.season && anime.seasonYear
                          ? `${
                              anime.season.charAt(0).toUpperCase() +
                              anime.season.slice(1)
                            } ${anime.seasonYear}`
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1">
                      Status
                    </span>
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">
                        {statusMapping[
                          anime.status as keyof typeof statusMapping
                        ] ||
                          anime.status ||
                          "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Genres Card */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="rounded-xl border p-4 bg-card/80 backdrop-blur-sm shadow-sm">
                  <h3 className="font-semibold text-sm mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre, index) => (
                      <Link
                        prefetch={true}
                        key={`${genre}-${index}`}
                        href={`/genres/${genre}`}
                        className="px-2.5 py-1 text-xs rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
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
                  <div className="rounded-xl border p-4 bg-card/80 backdrop-blur-sm shadow-sm">
                    <h3 className="font-semibold text-sm mb-3">Studios</h3>
                    <div className="flex flex-wrap gap-2">
                      {anime.studios.nodes.map((studio, index) => (
                        <Badge
                          key={`${studio.id}-${index}`}
                          variant="secondary"
                          className="rounded-full"
                        >
                          {studio.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* External Links */}
              {anime.externalLinks && anime.externalLinks.length > 0 && (
                <div className="rounded-xl border p-4 bg-card/80 backdrop-blur-sm shadow-sm">
                  <h3 className="font-semibold text-sm mb-3">External Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.externalLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
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
              <div className="md:block hidden bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border shadow-sm">
                <h1 className="text-2xl md:text-4xl font-bold text-white">
                  {title}
                </h1>
                {anime.title.native && (
                  <p className="mt-1 text-lg text-muted-foreground">
                    {anime.title.native}
                  </p>
                )}

                {/* Score, Popularity, Date & Duration */}
                <div className="flex flex-wrap gap-6 mt-4">
                  {anime.averageScore && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-yellow-500/10">
                        <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {anime.averageScore / 10}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Score
                        </div>
                      </div>
                    </div>
                  )}
                  {anime.popularity ? (
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {anime.popularity.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Popularity
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {anime.startDate && anime.startDate.year && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {`${anime.startDate.year}-${
                            anime.startDate.month
                              ?.toString()
                              .padStart(2, "0") || "??"
                          }-${
                            anime.startDate.day?.toString().padStart(2, "0") ||
                            "??"
                          }`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Release Date
                        </div>
                      </div>
                    </div>
                  )}
                  {anime.duration && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{anime.duration} min</div>
                        <div className="text-xs text-muted-foreground">
                          Per Episode
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Episode Info */}
                {anime.nextAiringEpisode && (
                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Info className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          Episode {anime.nextAiringEpisode.episode} airing in{" "}
                          {getTimeUntilAiring(anime.nextAiringEpisode.airingAt)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Next Episode
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {anime.description && (
                <div className="hidden md:block bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border shadow-sm">
                  <h3 className="font-semibold mb-4">Synopsis</h3>
                  <div
                    className="text-muted-foreground prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-foreground prose-a:text-primary"
                    dangerouslySetInnerHTML={{ __html: anime.description }}
                  />
                </div>
              )}

              {/* Trailer */}
              {anime.trailer && (
                <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border shadow-sm">
                  <h3 className="font-semibold mb-4">Trailer</h3>
                  <div className="aspect-video w-full overflow-hidden rounded-lg border">
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
              <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border shadow-sm">
                <Tabs defaultValue="characters" className="w-full">
                  <TabsList className="w-full mb-6 grid grid-cols-1 md:grid-cols-3 gap-2 h-auto">
                    <TabsTrigger value="characters" className="">
                      Characters
                    </TabsTrigger>
                    <TabsTrigger value="staff" className="">
                      Staff
                    </TabsTrigger>
                    <TabsTrigger value="recommendations" className="">
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
                            className="flex flex-col overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all hover:border-primary/50"
                          >
                            {/* Character Image */}
                            <div className="relative aspect-square overflow-hidden">
                              <Image
                                src={edge.node.image.large || ""}
                                alt={edge.node.name.full}
                                className="object-cover transition-transform duration-500 hover:scale-110"
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              />
                            </div>
                            {/* Character Details */}
                            <div className="p-3 flex flex-col flex-grow items-center bg-gradient-to-b from-background/50 to-background">
                              <h3 className="font-medium text-sm line-clamp-1 text-center">
                                {edge.node.name.full}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-1 text-center">
                                {edge.role}
                              </p>
                            </div>
                            {/* Voice Actor Info */}
                            {edge.voiceActors &&
                              edge.voiceActors.length > 0 && (
                                <div className="border-t p-2 flex flex-col md:flex-row items-center justify-center gap-2 bg-muted/30">
                                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                    <Image
                                      src={
                                        edge.voiceActors[0].image.large || ""
                                      }
                                      alt={edge.voiceActors[0].name.full}
                                      fill
                                      className="object-cover rounded-full border-2 border-primary/20 transition-transform duration-300 hover:scale-105"
                                      sizes="32px"
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
                      <div className="py-12 text-center text-muted-foreground">
                        <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No character information available</p>
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
                              className="overflow-hidden rounded-lg border hover:shadow-md transition-all hover:border-primary/50"
                            >
                              {/* Staff Image */}
                              <div className="relative aspect-square overflow-hidden">
                                <Image
                                  src={edge.node.image?.large || ""}
                                  alt={edge.node.name.full}
                                  className="object-cover transition-transform duration-500 hover:scale-110"
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                />
                              </div>
                              <div className="p-3 flex flex-col justify-center items-center bg-gradient-to-b from-background/50 to-background">
                                <h3 className="line-clamp-1 font-medium text-sm text-center">
                                  {edge.node.name.full}
                                </h3>
                                <p className="line-clamp-1 text-xs text-muted-foreground text-center">
                                  {edge.role}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No staff information available</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="recommendations" className="mt-4">
                    {anime.recommendations &&
                    anime.recommendations.nodes.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {anime.recommendations.nodes.map((nodes) => (
                          <Link
                            prefetch={true}
                            key={nodes.mediaRecommendation?.id}
                            href={`/anime/${nodes.mediaRecommendation.id}/${
                              nodes.mediaRecommendation.title?.english
                                ? slugify(
                                    nodes.mediaRecommendation.title.english
                                  )
                                : "untitled"
                            }`}
                            className="overflow-hidden rounded-lg border hover:shadow-md transition-all hover:border-primary/50 group"
                          >
                            <div className="h-full">
                              <div className="relative aspect-[4/3] w-full overflow-hidden">
                                <Image
                                  src={
                                    nodes.mediaRecommendation?.coverImage
                                      .large || ""
                                  }
                                  alt={
                                    nodes.mediaRecommendation?.title.english ||
                                    nodes.mediaRecommendation?.title.romaji ||
                                    ""
                                  }
                                  fill
                                  className="object-cover brightness-90 transition-transform duration-500 group-hover:scale-110"
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 group-hover:opacity-60 transition-opacity"></div>
                              </div>
                              <div className="p-3 bg-gradient-to-b from-background/50 to-background">
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
                      <div className="py-12 text-center text-muted-foreground">
                        <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No recommendations available</p>
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
