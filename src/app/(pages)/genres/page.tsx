"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import { GENRES_QUERY } from "@/app/graphql/queries/genres";
import GenresPageLoading from "./loading";

export default function GenresPage() {
  const { data, loading, error } = useQuery(GENRES_QUERY);

  if (loading) return <GenresPageLoading />;
  if (error) return <p>Error: {error.message}</p>;

  const genres = data.GenreCollection;

  return (
    <div className="">
      <section className="py-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-white">Anime Genres</h1>
        </div>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
          Discover your next favorite anime by exploring our comprehensive
          collection of genres
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {genres.map((genre: string) => (
          <Link
            prefetch={true}
            key={genre}
            href={`/genres/${encodeURIComponent(genre)}`}
          >
            <Card className="transition-all hover:scale-[1.02] hover:shadow-md overflow-hidden group border border-border/50 relative h-full">
              <CardContent className="flex h-28 items-center justify-center p-4 group-hover:bg-primary/30 transition-all duration-300">
                <div className="flex flex-col items-center gap-2 text-center">
                  <h2 className="text-center text-sm md:text-lg font-semibold group-hover:text-white transition-colors">
                    {genre}
                  </h2>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
