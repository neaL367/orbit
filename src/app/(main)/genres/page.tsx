import { Suspense } from "react";
import { Link } from "next-view-transitions";
import { Card, CardContent } from "@/components/ui/card";
import { GenreQueries } from "@/anilist/queries/genre";

export default async function GenresPage() {
  const data = await GenreQueries.getGenres();
  const genres = data?.data?.GenreCollection || [];

  return (
    <main className="mt-24 mb-24">
      <h1 className="mb-8 text-3xl font-bold text-white">Anime Genres</h1>

      <Suspense fallback={<p>Loading genres...</p>}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {genres.map((genre) => (
            <Link key={genre} href={`/genres/${encodeURIComponent(genre)}`}>
              <Card className="transition-all hover:scale-[1.02] hover:shadow-md overflow-hidden group border border-border/50">
                <CardContent className="flex h-24 items-center justify-center p-4 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-400 transition-all">
                  <h2 className="text-center text-lg font-semibold group-hover:text-white">
                    {genre}
                  </h2>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Suspense>
    </main>
  );
}
