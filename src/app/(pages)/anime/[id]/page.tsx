import { AnimeDetails } from "@/components/anime-details";
import { Navigation } from "@/components/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return {
    title: `Anime #${id} | Orbit`,
    description: `Discover details about Anime #${id} on Orbit.`,
  };
}

export default async function AnimePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-12">
      <Navigation />

      <AnimeDetails id={id} />
    </div>
  );
}
