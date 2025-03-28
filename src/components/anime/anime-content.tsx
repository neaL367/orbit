import Image from "next/image";
import { AnimeBanner } from "./anime-banner";
import { AnimeHeader } from "./anime-header";
import { AnimeStats } from "./anime-stats";
import { AnimeExternalLinks } from "./anime-external-links";
import { AnimeDescription } from "./anime-desc";
import { AnimeTabs } from "./anime-tabs";
import { AnimeTrailer } from "./anime-trailer";
import { AnimeMedia } from "@/anilist/modal/media";

export function AnimeContent({ anime }: { anime: AnimeMedia }) {
  // Format title for display
  const title = anime.title.english || anime.title.romaji;

  // Format description - remove HTML tags
  const description = anime.description
    ? anime.description.replace(/<[^>]*>/g, "")
    : "No description available.";

  return (
    <main className="mt-24 mb-24">
      {/* Banner Image */}
      {anime.bannerImage && (
        <AnimeBanner image={anime.bannerImage} title={title} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        {/* Cover Image and Stats Column */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="w-full max-w-[300px] mx-auto md:mx-0">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-xl border border-border/50 group hover:shadow-2xl transition-all duration-300">
              <Image
                src={
                  anime.coverImage.extraLarge || anime.coverImage.color || ""
                }
                alt={title}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-300 brightness-85"
                sizes="(max-width: 640px) 100vw, 300px"
              />
            </div>
          </div>

          {/* Stats */}
          <AnimeStats anime={anime} />

          {/* External Links */}
          {anime.externalLinks && anime.externalLinks.length > 0 && (
            <AnimeExternalLinks links={anime.externalLinks} />
          )}
        </div>

        {/* Details Column */}
        <div>
          <AnimeHeader anime={anime} />
          <AnimeDescription description={description} />
          <AnimeTabs anime={anime} />

          {/* Trailer */}
          {anime.trailer && anime.trailer.site === "youtube" && (
            <AnimeTrailer trailer={anime.trailer} title={title} />
          )}
        </div>
      </div>
    </main>
  );
}
