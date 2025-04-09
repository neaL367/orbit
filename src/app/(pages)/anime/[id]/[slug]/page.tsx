"use client";

import { useQuery } from "@apollo/client";
import { Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigator } from "@/components/navigator";

import { slugify } from "@/lib/utils";
import { AnimeMedia } from "@/lib/types";
import { ANIME_DETAILS_QUERY } from "@/app/graphql/queries/detail";
import AnimeDetailLoading from "./loading";

import { BannerImage } from "@/components/anime/banner-image";
import { CoverImage } from "@/components/anime/cover-image";
import { AnimeStats } from "@/components/anime/anime-stats";
import { AnimeInfoCard } from "@/components/anime/anime-info-card";
import { Synopsis } from "@/components/anime/synopsis";
import { ExternalLinks } from "@/components/anime/external-links";
import { useState, use } from "react";
import { Trailer } from "@/components/anime/trailer";

export default function AnimePage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [imageLoaded, setImageLoaded] = useState(false);

  const { data, loading, error } = useQuery(ANIME_DETAILS_QUERY, {
    variables: { id: id },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-first",
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
    <div className="space-y-6">
      <div className="">
        <Navigator />
      </div>

      <div className="min-h-screen pb-12 bg-gradient-to-b from-background to-background/95">
        {/* Banner with overlay */}
        <BannerImage bannerImage={anime.bannerImage} title={title} />

        <div className="relative">
          {/* Main Content */}
          <div className="mt-[-100px] sm:mt-[-150px] relative z-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
              {/* Left Column - Details */}
              <div className="space-y-6">
                {/* Cover Image */}
                <CoverImage
                  imageUrl={anime.coverImage.large || ""}
                  title={title}
                />

                {/* Mobile Stats */}
                <div className="block lg:hidden">
                  <AnimeStats anime={anime} title={title} />
                </div>

                {/* Mobile Synopsis */}
                {anime.description && (
                  <div className="block lg:hidden">
                    <Synopsis description={anime.description} />
                  </div>
                )}

                {/* Basic Details Card */}
                <AnimeInfoCard
                  anime={anime}
                  sourceMapping={sourceMapping}
                  statusMapping={statusMapping}
                />

                {/* External Links */}
                <ExternalLinks anime={anime} />
              </div>

              {/* Right Column - Main Content */}
              <div className="space-y-8">
                {/* Desktop Stats */}
                <div className="md:block hidden">
                  <AnimeStats anime={anime} title={title} />
                </div>

                {/* Desktop Synopsis */}
                {anime.description && (
                  <div className="hidden md:block">
                    <Synopsis description={anime.description} />
                  </div>
                )}

                {anime.trailer && <Trailer anime={anime} />}

                {/* Improved Tabs for Characters, Staff, etc. */}
                <div className="bg-card/80 backdrop-blur-sm rounded-xl border shadow-sm overflow-hidden">
                  <Tabs defaultValue="characters" className="w-full">
                    <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b">
                      <TabsList className="w-full h-auto justify-start rounded-none bg-transparent p-0">
                        <TabsTrigger
                          value="characters"
                          className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent font-medium"
                        >
                          Characters
                        </TabsTrigger>
                        <TabsTrigger
                          value="staff"
                          className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent font-medium"
                        >
                          Staff
                        </TabsTrigger>
                        <TabsTrigger
                          value="recommendations"
                          className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent font-medium"
                        >
                          Recommendations
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="characters" className="p-6">
                      {anime.characters &&
                      anime.characters.edges &&
                      anime.characters.edges.length > 0 ? (
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                          {anime.characters.edges.slice(0, 8).map((edge) => (
                            <div
                              key={edge.node.id}
                              className="flex flex-col overflow-hidden rounded-lg border bg-card/50 shadow-sm hover:shadow-md transition-all hover:border-primary/50"
                            >
                              {/* Character Image */}
                              <div className="relative aspect-square overflow-hidden bg-muted/30">
                                <Image
                                  src={edge.node.image.large || ""}
                                  alt={edge.node.name.full}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                  className={`object-cover transition-all hover:scale-105 duration-300 ${
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                  }`}
                                  onLoad={() => setImageLoaded(true)}
                                />
                              </div>
                              {/* Character Details */}
                              <div className="p-3 flex flex-col flex-grow items-center">
                                <h3 className="font-medium text-sm line-clamp-1 text-center">
                                  {edge.node.name.full}
                                </h3>
                                <p className="text-xs text-muted-foreground line-clamp-1 text-center mt-1">
                                  {edge.role}
                                </p>
                              </div>
                              {/* Voice Actor Info */}
                              {edge.voiceActors &&
                                edge.voiceActors.length > 0 && (
                                  <div className="border-t p-3 flex items-center justify-center gap-3 bg-muted/30">
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                      <Image
                                        src={
                                          edge.voiceActors[0].image.large || ""
                                        }
                                        alt={edge.voiceActors[0].name.full}
                                        fill
                                        className="object-cover border-2 border-primary/20"
                                        sizes="32px"
                                      />
                                    </div>
                                    <span className="text-xs font-medium line-clamp-1">
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

                    <TabsContent value="staff" className="p-6">
                      {anime.staff &&
                      anime.staff.edges &&
                      anime.staff.edges.length > 0 ? (
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                          {anime.staff.edges
                            .slice(0, 8)
                            .map((edge, index: number) => (
                              <div
                                key={`${edge.node.id}-${index}`}
                                className="overflow-hidden rounded-lg border bg-card/50 hover:shadow-md transition-all hover:border-primary/50"
                              >
                                {/* Staff Image */}
                                <div className="relative aspect-square overflow-hidden bg-muted/30">
                                  <Image
                                    src={edge.node.image?.large || ""}
                                    alt={edge.node.name.full}
                                    className="object-cover transition-transform duration-300 hover:scale-105"
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                  />
                                </div>
                                <div className="p-3 flex flex-col justify-center items-center">
                                  <h3 className="line-clamp-1 font-medium text-sm text-center">
                                    {edge.node.name.full}
                                  </h3>
                                  <p className="line-clamp-1 text-xs text-muted-foreground text-center mt-1">
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

                    <TabsContent value="recommendations" className="p-6">
                      {anime.recommendations &&
                      anime.recommendations.nodes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
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
                              className="overflow-hidden rounded-lg border bg-card/50 hover:shadow-md transition-all hover:border-primary/50 group h-full flex flex-col"
                            >
                              <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/30">
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
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                  className={`object-cover transition-all group-hover:scale-105 duration-300 ${
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                  }`}
                                  onLoad={() => setImageLoaded(true)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              </div>
                              <div className="p-3 flex-grow">
                                <h3 className="line-clamp-2 font-medium text-sm">
                                  {nodes.mediaRecommendation?.title.english ||
                                    nodes.mediaRecommendation?.title.romaji}
                                </h3>
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
    </div>
  );
}
