import { Suspense } from "react"
import { Link } from "next-view-transitions"
import { Card, CardContent } from "@/components/ui/card"
import { GenreQueries } from "@/lib/anilist/queries/genre";

export default async function GenresPage() {
  const data = await GenreQueries.getGenres()
  const genres = data?.data?.GenreCollection || []

  return (
    <div className="py-8">
      <h1 className="mb-8 text-3xl font-bold">Anime Genres</h1>

      <Suspense fallback={<p>Loading genres...</p>}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {genres.map((genre) => (
            <Link key={genre} href={`/genres/${encodeURIComponent(genre)}`}>
              <Card className="transition-all hover:scale-[1.02] hover:shadow-md">
                <CardContent className="flex h-24 items-center justify-center p-4">
                  <h2 className="text-center text-lg font-semibold">{genre}</h2>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Suspense>
    </div>
  )
}

