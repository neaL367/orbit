import Image from "next/image";
import { notFound } from "next/navigation";
import { GenreQueries } from "@/anilist/queries/genre";
import { Navigation } from "@/components/navigation";
import { AnimeBanner } from "@/components/anime/anime-banner";
import { AnimeDescription } from "@/components/anime/anime-desc";
import { AnimeExternalLinks } from "@/components/anime/anime-external-links";
import { AnimeHeader } from "@/components/anime/anime-header";
import { AnimeStats } from "@/components/anime/anime-stats";
import { AnimeTabs } from "@/components/anime/anime-tabs";
import { AnimeTrailer } from "@/components/anime/anime-trailer";

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

  return (
    <div>
      <Navigation />

      <div className="mt-24 mb-24">
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
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
      </div>
    </div>
  );
}
