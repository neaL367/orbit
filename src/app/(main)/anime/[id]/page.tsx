import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LoadingAnimeDetails } from "@/components/loading-anime";
import { AnimeContent } from "@/components/anime/anime-content";
import { GenreQueries } from "@/anilist/queries/genre";
import { Navigation } from "@/components/navigation";

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

  return (
    <div>
      <Navigation />

      <Suspense fallback={<LoadingAnimeDetails />}>
        <AnimeContent anime={anime} />
      </Suspense>
    </div>
  );
}
