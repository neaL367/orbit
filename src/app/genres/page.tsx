import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { getAllAnime } from "@/lib/db"

export default async function GenresPage() {
  const allAnime = await getAllAnime()

  // Extract all unique genres
  const genresMap = new Map<string, number>()

  allAnime.forEach((anime) => {
    anime.genres.forEach((genre) => {
      genresMap.set(genre, (genresMap.get(genre) || 0) + 1)
    })
  })

  // Sort genres by count
  const sortedGenres = Array.from(genresMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => ({ genre, count }))

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Anime Genres</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {sortedGenres.map(({ genre, count }) => (
          <Link key={genre} href={`/anime?genre=${genre}`}>
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="p-4 flex justify-between items-center">
                <span className="font-medium">{genre}</span>
                <span className="text-sm text-muted-foreground">{count}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

