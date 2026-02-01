"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, memo, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { hexToRgba, getAnimeTitle } from "@/lib/anime-utils";
import type { Media } from "@/lib/graphql/types/graphql";
import type { Route } from "next";

type AnimeCardProps = {
  anime: Media;
  rank?: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "auto" | "low";
};

const CoverImage = memo(function CoverImage({
  src,
  srcSet,
  sizes,
  alt,
  coverColor,
  loading = "lazy",
  fetchPriority = "low",
}: {
  src?: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  coverColor: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "auto" | "low";
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
      <div
        className="absolute inset-0 transition-opacity duration-200 ease-out"
        style={{
          backgroundColor: coverColor,
          opacity: loaded && !errored ? 0 : 1,
        }}
      />

      {src && !errored && (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setErrored(true);
            setLoaded(true);
          }}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ease-out",
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
        />
      )}
    </div>
  );
});

function AnimeCardComponent({
  anime,
  rank,
  loading = "lazy",
  fetchPriority = "low",
}: AnimeCardProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cardData = useMemo(() => {
    return {
      id: anime.id,
      title: getAnimeTitle(anime),
      coverImage: anime.coverImage
        ? {
            medium: anime.coverImage.medium,
            large: anime.coverImage.large,
            extraLarge: anime.coverImage.extraLarge,
            color: anime.coverImage.color,
          }
        : null,
      episodes: anime.episodes,
      duration: anime.duration,
      genres: anime.genres,
      format: anime.format,
      startYear: anime.startDate?.year,
    };
  }, [anime]);

  const title = cardData.title;
  const coverImage =
    cardData.coverImage?.medium ||
    cardData.coverImage?.large ||
    cardData.coverImage?.extraLarge ||
    undefined;
  const coverColor = cardData.coverImage?.color || "#1a1a1a";

  const coverSrcSet = useMemo(() => {
    const arr: string[] = [];
    if (cardData.coverImage?.medium)
      arr.push(`${cardData.coverImage.medium} 300w`);
    if (cardData.coverImage?.large)
      arr.push(`${cardData.coverImage.large} 500w`);
    if (cardData.coverImage?.extraLarge)
      arr.push(`${cardData.coverImage.extraLarge} 700w`);
    return arr.length > 0 ? arr.join(", ") : undefined;
  }, [cardData.coverImage]);

  const handleClick = useCallback(() => {
    const referrerData = {
      pathname: pathname,
      search: searchParams.toString(),
      sort: pathname === "/anime" ? searchParams.get("sort") : null,
    };
    sessionStorage.setItem("animeDetailReferrer", JSON.stringify(referrerData));
    sessionStorage.setItem("animeDetailTitle", title);
  }, [pathname, searchParams, title]);

  const episodes = cardData.episodes ?? undefined;
  const duration = cardData.duration ?? undefined;
  const genres = useMemo(
    () => cardData.genres?.filter(Boolean) || [],
    [cardData.genres]
  );
  const format = cardData.format ?? undefined;
  const year = cardData.startYear ?? undefined;

  const styles = useMemo(() => {
    const badgeBg = hexToRgba(coverColor, 0.3);
    const badgeBorder = hexToRgba(coverColor, 0.5);
    const rankBg = hexToRgba(coverColor, 0.85);
    return { badgeBg, badgeBorder, rankBg };
  }, [coverColor]);

  return (
    <Link
      href={`/anime/${cardData.id}` as Route}
      onClick={handleClick}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-zinc-400 rounded-xl"
      aria-label={`View ${title} details`}
    >
      <Card
        className={cn(
          "relative overflow-hidden rounded-xl border bg-zinc-900/90",
          "transition-transform duration-150 ease-out",
          "hover:-translate-y-1 will-change-transform"
        )}
      >
        <div className="relative w-full">
          <CoverImage
            src={coverImage}
            srcSet={coverSrcSet}
            sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 500px"
            alt={title}
            coverColor={coverColor}
            loading={loading}
            fetchPriority={fetchPriority}
          />

          {rank !== undefined && (
            <div className="absolute top-0 left-0 z-20">
              <div
                className="relative flex items-center justify-center min-w-[44px] h-11 px-3 rounded-br-2xl rounded-tl-lg transition-transform duration-150"
                style={{ backgroundColor: styles.rankBg }}
              >
                <span className="relative text-sm font-extrabold text-white tracking-tight">
                  #{rank}
                </span>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2.5 z-10">
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-zinc-100 transition-colors">
              {title}
            </h3>

            <div className="hidden sm:flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs">
              {episodes && (
                <span className="text-white/95 font-semibold bg-white/10 px-2 py-0.5 rounded-md">
                  {episodes} ep
                </span>
              )}
              {duration && (
                <span className="text-white/90 font-medium">{duration}m</span>
              )}
              {year && (
                <span className="text-white/85 font-medium">{year}</span>
              )}
              {format && (
                <span className="text-white/75 text-[10px] uppercase tracking-wider font-medium">
                  {format.replace(/_/g, " ")}
                </span>
              )}
            </div>

            {genres.length > 0 && (
              <div className="hidden sm:flex flex-wrap gap-1.5">
                {genres.slice(0, 2).map((genre: string | null) => (
                  <Badge
                    key={genre}
                    className="text-[10px] font-semibold px-2.5 py-1 text-white border"
                    style={{
                      backgroundColor: styles.badgeBg,
                      borderColor: styles.badgeBorder,
                    }}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export const AnimeCard = memo(AnimeCardComponent);
