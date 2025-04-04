import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { fetchGenres } from "@/lib/api";

export const metadata = {
  title: "Anime Genres | Orbit",
  description: "Browse anime by genre on Orbit",
};

export default async function GenresPage() {
  const genres = await fetchGenres();

  return (
    <div className="">
      <section className="py-8">
        <h1 className="text-4xl font-bold mb-4">Anime Genres</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Browse anime by genre
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {genres.map((genre) => (
          <Link
            prefetch={true}
            key={genre}
            href={`/genres/${encodeURIComponent(genre)}`}
          >
            <Card className="transition-all hover:scale-[1.02] hover:shadow-md overflow-hidden group border border-border/50 relative">
              <CardContent className="flex h-24 items-center justify-center p-4 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-400 transition-all">
                <div className="flex flex-col items-center gap-2 text-center">
                  <h2 className="text-center text-sm md:text-lg font-semibold group-hover:text-white">
                    {genre}
                  </h2>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
