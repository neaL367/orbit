"use client";

import { useEffect, useMemo, useState } from "react";
import { Suspense } from "react";
import { Link } from "next-view-transitions";
import { Card, CardContent } from "@/components/ui/card";
import { GenreQueries } from "@/anilist/queries/genre";
import NSFWToggle from "@/components/nsfw-toggle";

const NSFW_GENRES = ["Hentai", "Ecchi", "Adult"];

export default function GenresPage() {
  const [showNSFW, setShowNSFW] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    GenreQueries.getGenres().then((data) => {
      const rawGenres = data?.data?.GenreCollection || [];
      setGenres(rawGenres);
    });
  }, []);

  const filteredGenres = useMemo(() => {
    return showNSFW ? genres : genres.filter((g) => !NSFW_GENRES.includes(g));
  }, [genres, showNSFW]);

  return (
    <div className="">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Anime Genres</h1>
        <NSFWToggle value={showNSFW} onChange={setShowNSFW} />
      </div>

      <Suspense fallback={<p>Loading genres...</p>}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredGenres.map((genre) => {
            const isNSFW = NSFW_GENRES.includes(genre);

            return (
              <Link key={genre} href={`/genres/${encodeURIComponent(genre)}`}>
                <Card className="transition-all hover:scale-[1.02] hover:shadow-md overflow-hidden group border border-border/50 relative">
                  {/* NSFW Badge */}
                  {isNSFW && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase z-10">
                      NSFW
                    </span>
                  )}
                  <CardContent className="flex h-24 items-center justify-center p-4 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-400 transition-all">
                    <h2 className="text-center text-lg font-semibold group-hover:text-white">
                      {genre}
                    </h2>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </Suspense>
    </div>
  );
}
