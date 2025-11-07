"use client"

import type { Media } from "@/graphql/graphql"
import { ExternalLinks } from "@/features/anime-detail"

type InfoProps = {
  anime: Media
}

export function Info({ anime }: InfoProps) {
  const format = anime?.format
  const episodes = anime?.episodes
  const duration = anime?.duration
  const season = anime?.season
  const seasonYear = anime?.seasonYear
  const status = anime?.status
  const source = anime?.source
  const genres = anime?.genres?.filter(Boolean) || []
  const studios = anime?.studios?.nodes?.filter(Boolean) || []
  const externalLinks = anime?.externalLinks || []

  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Anime Details</h2>

      {/* General Info */}
      <div className="space-y-4 sm:space-y-5">
        <div>
          <div className="space-y-3">
            {format && (
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Format
                </div>
                <div className="text-sm sm:text-base font-medium text-white">{format}</div>
              </div>
            )}
            {episodes && (
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Episodes
                </div>
                <div className="text-sm sm:text-base font-medium text-white">{episodes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <div className="space-y-3">
            {duration && (
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Duration
                </div>
                <div className="text-sm sm:text-base font-medium text-white">{duration} min</div>
              </div>
            )}
            {season && seasonYear && (
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Season
                </div>
                <div className="text-sm sm:text-base font-medium text-white capitalize">
                  {season.toUpperCase()} {seasonYear}
                </div>
              </div>
            )}
            {status && (
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Status
                </div>
                <div className="text-sm sm:text-base font-medium text-white capitalize">
                  {status === "RELEASING" ? "Currently Releasing" : status.toLowerCase().replace("_", " ")}
                </div>
              </div>
            )}
            {source && (
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Source
                </div>
                <div className="text-sm sm:text-base font-medium text-white capitalize">
                  {source.toLowerCase().replace("_", " ")}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Genres */}
      {genres.length > 0 && (
        <div className="pt-4 border-t border-zinc-800">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Genres</div>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <span
                key={g}
                className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-zinc-800/50 border border-zinc-700 text-white hover:bg-zinc-700/50 transition-colors"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Studios */}
      {studios.length > 0 && (
        <div className="pt-4 border-t border-zinc-800">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Studios</div>
          <div className="space-y-1.5">
            {studios.map(
              (s) =>
                s && (
                  <div key={s.id} className="text-sm sm:text-base font-medium text-white">
                    {s.name}
                  </div>
                ),
            )}
          </div>
        </div>
      )}

      {/* External Links */}
      <div className="pt-4 border-t border-zinc-800">
        <ExternalLinks externalLinks={externalLinks} />
      </div>
    </div>
  )
}

