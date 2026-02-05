"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, memo, useCallback, useMemo, useRef, useEffect } from "react";
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
};

const CoverImage = memo(function CoverImage({
  lowResSrc,
  highResSrc,
  srcSet,
  alt,
  coverColor,
  loading = "lazy",
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw",
}: {
  lowResSrc?: string;
  highResSrc?: string;
  srcSet?: string;
  alt: string;
  coverColor: string;
  loading?: "eager" | "lazy";
  sizes?: string;
}) {
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [lowResLoaded, setLowResLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const highResRef = useRef<HTMLImageElement>(null);
  const lowResRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (highResRef.current?.complete) {
        setHighResLoaded(true);
      }
      if (lowResRef.current?.complete) {
        setLowResLoaded(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-900">
      {/* 1. Base Placeholder Color */}
      <div
        className="absolute inset-0 transition-opacity duration-500 ease-out"
        style={{
          backgroundColor: coverColor,
          opacity: highResLoaded ? 0 : 1,
        }}
      />

      {/* 2. Low Resolution Image (Loads fast, blurred) */}
      {lowResSrc && !errored ? (
        <img
          ref={lowResRef}
          src={lowResSrc}
          alt=""
          aria-hidden="true"
          loading={loading}
          referrerPolicy="no-referrer"
          onLoad={() => setLowResLoaded(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover blur-sm transition-opacity duration-500",
            lowResLoaded && !highResLoaded ? "opacity-50" : "opacity-0"
          )}
        />
      ) : null}

      {/* 3. High Resolution / Responsive Image */}
      {highResSrc && !errored ? (
        <img
          ref={highResRef}
          src={highResSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={loading}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setHighResLoaded(true)}
          onError={() => {
            setErrored(true);
            setHighResLoaded(true);
          }}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out",
            highResLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
        />
      ) : null}
    </div>
  );
});

function AnimeCardComponent({
  anime,
  rank,
  loading = "lazy",
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

  // Use medium for low-res placeholder, large for high-res
  const lowResSrc = cardData.coverImage?.medium || undefined;
  const highResSrc = cardData.coverImage?.extraLarge || cardData.coverImage?.large || lowResSrc;
  const coverColor = cardData.coverImage?.color || "#1a1a1a";

  const srcSet = useMemo(() => {
    const images = [];
    if (cardData.coverImage?.medium) images.push(`${cardData.coverImage.medium} 230w`);
    if (cardData.coverImage?.large) images.push(`${cardData.coverImage.large} 460w`);
    if (cardData.coverImage?.extraLarge) images.push(`${cardData.coverImage.extraLarge} 700w`);
    return images.length > 0 ? images.join(", ") : undefined;
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
            lowResSrc={lowResSrc}
            highResSrc={highResSrc}
            srcSet={srcSet}
            alt={title}
            coverColor={coverColor}
            loading={loading}
          />

          {rank !== undefined ? (
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
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2.5 z-10">
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-zinc-100 transition-colors">
              {title}
            </h3>

            <div className="hidden sm:flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs">
              {episodes ? (
                <span className="text-white/95 font-semibold bg-white/10 px-2 py-0.5 rounded-md">
                  {episodes} ep
                </span>
              ) : null}
              {duration ? (
                <span className="text-white/90 font-medium">{duration}m</span>
              ) : null}
              {year ? (
                <span className="text-white/85 font-medium">{year}</span>
              ) : null}
              {format ? (
                <span className="text-white/75 text-[10px] uppercase tracking-wider font-medium">
                  {format.replace(/_/g, " ")}
                </span>
              ) : null}
            </div>

            {genres.length > 0 ? (
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
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export const AnimeCard = memo(AnimeCardComponent);
