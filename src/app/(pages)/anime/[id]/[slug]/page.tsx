import { AnimeDetails } from "@/components/anime-details";
import { Navigator } from "@/components/navigator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: `${slug} | Orbit`,
    description: `Discover details about ${slug} on Orbit.`,
  };
}

export default async function AnimePage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="">
        <Navigator />
      </div>

      <AnimeDetails id={id} />
    </div>
  );
}
