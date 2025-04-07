import { AnimeDetails } from "@/components/anime-details";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <div className="space-y-6">
      <div className="">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to home</span>
          </Link>
        </Button>
      </div>

      <AnimeDetails id={id} />
    </div>
  );
}
