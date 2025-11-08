"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Media } from "@/graphql/graphql"

type CharacterEdge = NonNullable<NonNullable<Media["characters"]>["edges"]>[number]

type CharactersProps = {
  characters: Array<CharacterEdge | null>
}

function getImageSrcSet(image: { medium?: string | null; large?: string | null } | null | undefined): string | undefined {
  if (!image) return undefined
  const images = []
  if (image.medium) images.push(`${image.medium} 300w`)
  if (image.large) images.push(`${image.large} 600w`)
  return images.length > 0 ? images.join(', ') : undefined
}

export function Characters({ characters }: CharactersProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  
  const validCharacters = characters.filter((edge) => edge?.node).slice(0, 12)

  if (validCharacters.length === 0) return null

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => new Set(prev).add(id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Cast & Characters</h2>
        <p className="text-sm text-zinc-400">Meet the characters bringing this story to life</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
        {validCharacters.map((edge) => {
          if (!edge?.node) return null

          const character = edge.node
          const characterName = character.name?.full || character.name?.native || "Unknown"
          const characterImage = character.image?.large || character.image?.medium
          const characterImageSrcSet = getImageSrcSet(character.image)
          const voiceActors = edge.voiceActors?.filter(Boolean) || []

          return (
            <div key={character.id} className="group">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800 mb-3 shadow-xl ring-1 ring-zinc-800/50 group-hover:ring-zinc-700/50 transition-all duration-200">
                <div
                  className="absolute inset-0 bg-zinc-800 transition-opacity duration-500"
                  style={{ opacity: loadedImages.has(character.id) ? 0 : 1 }}
                />
                {characterImage ? (
                  <img
                    src={characterImage || ""}
                    srcSet={characterImageSrcSet}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    alt={characterName}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onLoad={() => handleImageLoad(character.id)}
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                      loadedImages.has(character.id) ? "opacity-100 scale-100" : "opacity-0 scale-105",
                      "group-hover:scale-110"
                    )}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="space-y-2 flex flex-col items-center text-center">
                <p className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight">{characterName}</p>
                {edge.role && (
                  <p className="text-[10px] sm:text-xs text-zinc-400 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800/50 border border-zinc-700/50">
                    {edge.role}
                  </p>
                )}
                {voiceActors.length > 0 && (
                  <div className="pt-1.5 w-full">
                    {voiceActors.slice(0, 1).map((va) => {
                      if (!va) return null
                      const vaName = va.name?.full || va.name?.native || "Unknown"
                      const vaImage = va.image?.large || va.image?.medium
                      const vaImageSrcSet = getImageSrcSet(va.image)
                      return (
                        <div key={va.id} className="flex items-center gap-1.5 text-[10px] sm:text-xs justify-center">
                          {vaImage ? (
                            <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-zinc-700/50">
                              <div className="absolute inset-0 bg-zinc-700 transition-opacity duration-300" style={{ opacity: loadedImages.has(va.id) ? 0 : 1 }} />
                              <img
                                src={vaImage || ""}
                                srcSet={vaImageSrcSet}
                                sizes="28px"
                                alt={vaName}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                onLoad={() => handleImageLoad(va.id)}
                                className={cn(
                                  "absolute inset-0 w-full h-full object-cover rounded-full transition-opacity duration-300",
                                  loadedImages.has(va.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </div>
                          ) : (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-700 shrink-0" />
                          )}
                          <p className="text-zinc-400 line-clamp-1 font-medium">{vaName}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

