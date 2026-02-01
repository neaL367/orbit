"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Media } from "@/lib/graphql/types/graphql"
import { ExternalLinks } from "../external-links"

type InfoProps = {
  anime: Media
}

function InfoItem({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-sm sm:text-base font-semibold text-white">
        {value}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusText = status === "RELEASING" ? "Currently Airing" : status.toLowerCase().replace(/_/g, " ")
  const statusColors = {
    RELEASING: "bg-green-500/20 text-green-400 border-green-500/50",
    FINISHED: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    NOT_YET_RELEASED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/50",
    HIATUS: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  }
  const colorClass = statusColors[status as keyof typeof statusColors] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/50"

  return (
    <Badge className={cn("px-3 py-1.5 text-xs font-semibold", colorClass)}>
      {statusText}
    </Badge>
  )
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
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Anime Details</h2>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {format && (
          <InfoItem label="Format" value={format.replace(/_/g, " ")} />
        )}
        {episodes && (
          <InfoItem label="Episodes" value={episodes} />
        )}
        {duration && (
          <InfoItem label="Duration" value={`${duration} min`} />
        )}
        {season && seasonYear && (
          <InfoItem 
            label="Season" 
            value={`${season.charAt(0) + season.slice(1).toLowerCase()} ${seasonYear}`} 
          />
        )}
        {status && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Status
            </div>
            <StatusBadge status={status} />
          </div>
        )}
        {source && (
          <InfoItem 
            label="Source" 
            value={source.toLowerCase().replace(/_/g, " ")} 
          />
        )}
      </div>

      {/* Genres */}
      {genres.length > 0 && (
        <div className="pt-6 border-t border-zinc-800/50">
          <div className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
            Genres
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <Badge
                key={g}
                variant="outline"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold bg-zinc-800/60 border-zinc-700/60 text-white hover:bg-zinc-700/60 hover:border-zinc-600/60 transition-all"
              >
                {g}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Studios */}
      {studios.length > 0 && (
        <div className="pt-6 border-t border-zinc-800/50">
          <div className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
            Studios
          </div>
          <div className="flex flex-wrap gap-2">
            {studios.map(
              (s) =>
                s && (
                  <Badge
                    key={s.id}
                    variant="outline"
                    className="px-3 py-1.5 text-xs sm:text-sm font-semibold bg-zinc-800/60 border-zinc-700/60 text-white hover:bg-zinc-700/60 hover:border-zinc-600/60 transition-all"
                  >
                    {s.name}
                  </Badge>
                ),
            )}
          </div>
        </div>
      )}

      {/* External Links */}
      {externalLinks.length > 0 && (
        <div className="pt-6 border-t border-zinc-800/50">
          <ExternalLinks externalLinks={externalLinks} />
        </div>
      )}
    </div>
  )
}

