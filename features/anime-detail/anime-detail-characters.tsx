"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Media } from "@/graphql/graphql"

type CharacterEdge = NonNullable<NonNullable<Media["characters"]>["edges"]>[number]

type AnimeDetailCharactersProps = {
  characters: Array<CharacterEdge | null>
}

export function AnimeDetailCharacters({ characters }: AnimeDetailCharactersProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  
  const validCharacters = characters.filter((edge) => edge?.node).slice(0, 12)

  if (validCharacters.length === 0) return null

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => new Set(prev).add(id))
  }

  return (
    <div className="mt-16 space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Cast & Characters</h2>
        <p className="text-zinc-400 text-sm md:text-base">Meet the characters bringing this story to life</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {validCharacters.map((edge) => {
          if (!edge?.node) return null

          const character = edge.node
          const characterName = character.name?.full || character.name?.native || "Unknown"
          const characterImage = character.image?.large || character.image?.medium
          const voiceActors = edge.voiceActors?.filter(Boolean) || []

          return (
            <div key={character.id} className="group">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 mb-3 shadow-lg transition-transform duration-300 hover:scale-105">
                {characterImage ? (
                  <Image
                    src={characterImage || "/placeholder.svg"}
                    alt={characterName}
                    fill
                    sizes="50vw"
                    onLoadingComplete={() => handleImageLoad(character.id)}
                    className={cn(
                      "object-cover w-full h-full transition-all duration-700 ease-in-out",
                      loadedImages.has(character.id) ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg"
                    )}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="space-y-2 flex flex-col items-center justify-center">
                <p className="text-sm font-semibold line-clamp-2 leading-tight">{characterName}</p>
                {edge.role && <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">{edge.role}</p>}
                {voiceActors.length > 0 && (
                  <div className="pt-2 space-y-2">
                    {voiceActors.slice(0, 1).map((va) => {
                      if (!va) return null
                      const vaName = va.name?.full || va.name?.native || "Unknown"
                      const vaImage = va.image?.large || va.image?.medium
                      return (
                        <div key={va.id} className="flex items-center gap-2 text-xs mb-2.5">
                          {vaImage ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-zinc-700">
                              <Image
                                src={vaImage || "/placeholder.svg"}
                                alt={vaName}
                                fill
                                sizes="50vw"
                                onLoadingComplete={() => handleImageLoad(va.id)}
                                className={cn(
                                  "object-cover transition-all duration-700 ease-in-out",
                                  loadedImages.has(va.id) ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg"
                                )}
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-700 shrink-0" />
                          )}
                          <p className="text-zinc-400 line-clamp-1">{vaName}</p>
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
